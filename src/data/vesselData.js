export const vesselTypes = {
  'Container Ship': {
    description: "The backbone of global trade, these ships are designed to carry standardized intermodal containers. They feature large, open decks and cellular holds for efficient stacking.",
    stats: { Capacity: 'Up to 24,000 TEU', 'Avg. Speed': '16-22 knots', Length: 'Up to 400 meters' },
    cargo: ['Consumer Goods', 'Electronics', 'Vehicles', 'Refrigerated Items'],
    heatmapData: { Speed: 8, Capacity: 9, Efficiency: 7 },
    visual: {
      hullPath: "M 10 55 C 20 40, 230 40, 240 55 L 235 75 L 15 75 Z",
      superstructure: [
        { type: 'rect', x: 190, y: 35, width: 30, height: 20, fill: '#e5e7eb' },
        { type: 'rect', x: 25, y: 55, width: 160, height: 10, fill: '#a1a1aa' },
        { type: 'rect', x: 30, y: 58, width: 20, height: 4, fill: '#71717a' },
      ],
      color: '#22c55e', 
    }
  },
  'Bulk Carrier': {
    description: "Designed to transport unpackaged bulk cargo, such as grains, coal, ore, and cement. They feature a series of large, flat hatches over the cargo holds.",
    stats: { Capacity: 'Up to 400,000 DWT', 'Avg. Speed': '12-15 knots', Length: 'Up to 360 meters' },
    cargo: ['Iron Ore', 'Grains (Wheat, Soy)', 'Coal', 'Bauxite/Alumina'],
    heatmapData: { Speed: 5, Capacity: 10, Efficiency: 8 },
    visual: {
      hullPath: "M 15 58 C 20 50, 230 50, 235 58 L 230 78 L 20 78 Z",
      superstructure: [
        { type: 'rect', x: 180, y: 40, width: 35, height: 18, fill: '#e5e7eb' },
        { type: 'rect', x: 30, y: 53, width: 30, height: 5, fill: '#d4d4d8' },
      ],
      color: '#f97316',
    }
  },
  'Ro-Ro Ship': {
    description: "Roll-on/Roll-off ships are vessels designed to carry wheeled cargo, such as cars and trucks, which are driven on and off the ship on their own wheels.",
    stats: { Capacity: 'Up to 8,500 CEU', 'Avg. Speed': '18-20 knots', Length: 'Up to 265 meters' },
    cargo: ['Automobiles', 'Heavy Machinery', 'Project Cargo', 'Trailers'],
    heatmapData: { Speed: 9, Capacity: 6, Efficiency: 6 },
    visual: {
      hullPath: "M 20 60 C 25 55, 225 55, 230 60 L 225 80 L 25 80 Z",
      superstructure: [{ type: 'rect', x: 25, y: 35, width: 200, height: 25, fill: '#e5e7eb' }, { type: 'path', d: 'M 200 35 L 225 60', stroke: '#a1a1aa' }],
      color: '#16a34a',
    }
  },
  'Tanker': {
    description: "Specialized for transporting liquids or gases in bulk. Subtypes include oil tankers, chemical tankers, and LNG carriers, each with specific safety and handling systems.",
    stats: { Capacity: 'Up to 550,000 DWT', 'Avg. Speed': '14-16 knots', Length: 'Up to 380 meters' },
    cargo: ['Crude Oil', 'Petroleum Products', 'Chemicals', 'LNG'],
    heatmapData: { Speed: 6, Capacity: 10, Efficiency: 9 },
    visual: {
      hullPath: "M 10 60 C 15 50, 235 50, 240 60 L 235 75 L 15 75 Z",
      superstructure: [{ type: 'rect', x: 200, y: 45, width: 25, height: 15, fill: '#e5e7eb' }, { type: 'rect', x: 30, y: 55, width: 160, height: 5, fill: '#d4d4d8' }],
      color: '#8b5cf6',
    }
  },
};
