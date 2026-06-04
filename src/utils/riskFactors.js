const CARGO_REQS = {
  pharma: ['GDP'],
  hazmat: ['ADR', 'GDP'],
  cold:   ['GDP'],
  air:    ['IATA'],
}

export function getLaneRiskFactors(lane) {
  const factors = []
  const req = [
    ...(CARGO_REQS[lane.cargo_type] || []),
    ...(lane.extra_certs || []),
  ]
  const nodes    = lane.lane_nodes?.map(ln => ln.node) || []
  const carriers = lane.lane_legs?.map(ll => ll.carrier).filter(Boolean) || []

  // Temperature
  if (lane.temp_min !== null && lane.temp_min !== '') {
    const frozen = parseFloat(lane.temp_min) < 0
    factors.push({
      type:     'temp',
      severity: frozen ? 'high' : 'medium',
      detail:   `${lane.temp_min}–${lane.temp_max}${lane.temp_unit}`,
    })
  }

  // Cert gaps on nodes
  const badNodes  = nodes.filter(n => req.some(r => !n.certs?.[r] || n.certs[r] === 'bad')).length
  const warnNodes = nodes.filter(n => req.some(r => n.certs?.[r] === 'warn')).length
  const badCarr   = carriers.filter(c => req.some(r => !c.certs?.includes(r) || c.cert_statuses?.[r] === 'bad')).length
  const warnCarr  = carriers.filter(c => req.some(r => c.certs?.includes(r) && c.cert_statuses?.[r] === 'warn')).length

  if (badNodes + badCarr > 0) {
    factors.push({ type: 'cert', severity: 'high', detail: `${badNodes + badCarr} gap(s)` })
  } else if (warnNodes + warnCarr > 0) {
    factors.push({ type: 'cert', severity: 'medium', detail: `${warnNodes + warnCarr} expiring` })
  }

  // Carrier rating
  const badCarriers  = carriers.filter(c => c.rating < 3).length
  const warnCarriers = carriers.filter(c => c.rating >= 3 && c.rating < 4).length
  if (badCarriers > 0) {
    factors.push({ type: 'carrier', severity: 'high', detail: `${badCarriers} rated below 3` })
  } else if (warnCarriers > 0) {
    factors.push({ type: 'carrier', severity: 'medium', detail: `${warnCarriers} below 4` })
  }

  // Geographic risk
  const hiNodes = nodes.filter(n => n.risk > 6).length
  const mdNodes = nodes.filter(n => n.risk > 3 && n.risk <= 6).length
  if (hiNodes > 0) {
    factors.push({ type: 'geo', severity: 'high', detail: `${hiNodes} high-risk node(s)` })
  } else if (mdNodes > 0) {
    factors.push({ type: 'geo', severity: 'medium', detail: `${mdNodes} medium-risk node(s)` })
  }

  // Transit time
  if (lane.total_hours > 168) {
    factors.push({ type: 'transit', severity: 'high', detail: lane.transit })
  } else if (lane.total_hours > 72) {
    factors.push({ type: 'transit', severity: 'medium', detail: lane.transit })
  }

  return factors
}