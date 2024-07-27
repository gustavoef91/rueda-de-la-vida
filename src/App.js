import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from "jspdf";

const RuedaDeLaVida = () => {
  const [areas, setAreas] = useState([
    { nombre: 'Salud y deporte', valor: 5, color: '#8FBC8F' },
    { nombre: 'Dinero', valor: 8, color: '#4682B4' },
    { nombre: 'Carrera / Negocio', valor: 7, color: '#20B2AA' },
    { nombre: 'Entorno y amigos', valor: 8, color: '#FFA07A' },
    { nombre: 'Amor, Familia, Hijos', valor: 5, color: '#FFB6C1' },
    { nombre: 'Crecimiento personal', valor: 8, color: '#87CEFA' },
    { nombre: 'Hobby, Recreación', valor: 7, color: '#F0E68C' },
    { nombre: 'Espiritualidad', valor: 8, color: '#DDA0DD' },
  ]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const svgRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAreaChange = (index, field, value) => {
    const newAreas = [...areas];
    newAreas[index][field] = field === 'valor' ? Math.min(10, Math.max(0, value)) : value;
    setAreas(newAreas);
  };

  const addArea = () => {
    setAreas([...areas, { nombre: 'Nueva Área', valor: 5, color: '#000000' }]);
  };

  const removeArea = (index) => {
    const newAreas = areas.filter((_, i) => i !== index);
    setAreas(newAreas);
  };

  const renderWheel = () => {
    const totalAreas = areas.length;
    const angleStep = (2 * Math.PI) / totalAreas;
    const svgSize = windowWidth < 768 ? 300 : 500;
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    const maxRadius = (svgSize / 2) * 0.8;
    const labelRadius = maxRadius * 1.1;

    return (
      <svg ref={svgRef} width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        <circle cx={centerX} cy={centerY} r={maxRadius} fill="none" stroke="#333" strokeWidth="2" />
        
        {areas.map((area, index) => {
          const startAngle = index * angleStep - Math.PI / 2;
          const endAngle = (index + 1) * angleStep - Math.PI / 2;
          const radius = (area.valor / 10) * maxRadius;

          const x1 = centerX + Math.cos(startAngle) * radius;
          const y1 = centerY + Math.sin(startAngle) * radius;
          const x2 = centerX + Math.cos(endAngle) * radius;
          const y2 = centerY + Math.sin(endAngle) * radius;

          const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";

          const path = `
            M ${centerX} ${centerY}
            L ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            Z
          `;

          const labelAngle = (startAngle + endAngle) / 2;
          const labelX = centerX + Math.cos(labelAngle) * labelRadius;
          const labelY = centerY + Math.sin(labelAngle) * labelRadius;

          return (
            <g key={index}>
              <path d={path} fill={area.color} stroke="white" strokeWidth="2" />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${(labelAngle * 180 / Math.PI) + 90}, ${labelX}, ${labelY})`}
                fontSize={windowWidth < 768 ? "10" : "12"}
                fill="#333"
              >
                {area.nombre}
              </text>
              <text
                x={centerX + Math.cos(labelAngle) * (radius / 2)}
                y={centerY + Math.sin(labelAngle) * (radius / 2)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={windowWidth < 768 ? "14" : "16"}
                fontWeight="bold"
              >
                {area.valor}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const downloadPDF = () => {
    const pdf = new jsPDF();
    const svgElement = svgRef.current;
    
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      canvas.width = svgElement.width.baseVal.value * 2;  // Duplicamos la resolución
      canvas.height = svgElement.height.baseVal.value * 2;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = function() {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngData = canvas.toDataURL("image/png");
        
        pdf.setFontSize(20);
        pdf.text("Rueda de la Vida", 105, 15, { align: "center" });
        pdf.addImage(pngData, 'PNG', 10, 30, 190, 190);
        pdf.save("rueda_de_la_vida.pdf");
      }
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  const generateRecommendations = () => {
    let recommendations = [];
    const lowAreas = areas.filter(area => area.valor < 5);
    const highAreas = areas.filter(area => area.valor > 7);

    if (lowAreas.length > 0) {
      recommendations.push(`Áreas que necesitan atención: ${lowAreas.map(a => a.nombre).join(', ')}. Considera establecer metas específicas para mejorar en estas áreas.`);
    }

    if (highAreas.length > 0) {
      recommendations.push(`Fortalezas: ${highAreas.map(a => a.nombre).join(', ')}. Aprovecha estas áreas para impulsar tu crecimiento general.`);
    }

    const balance = Math.max(...areas.map(a => a.valor)) - Math.min(...areas.map(a => a.valor));
    if (balance > 5) {
      recommendations.push("Tu vida parece estar desbalanceada. Intenta equilibrar tus esfuerzos entre las diferentes áreas.");
    } else if (balance < 3) {
      recommendations.push("Tu vida parece estar bien equilibrada. Continúa manteniendo este equilibrio mientras buscas mejorar en todas las áreas.");
    }

    return recommendations;
  };

  return (
    <div className="flex flex-col items-center p-4 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center w-full">Rueda de la Vida</h2>
      <div className="flex justify-center mb-4 w-full">
        {renderWheel()}
      </div>
      <div className="flex flex-col items-center w-full max-w-md">
        <button 
          onClick={downloadPDF} 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4 w-full"
        >
          Descargar PDF
        </button>
        <button 
          onClick={() => alert(generateRecommendations().join('\n\n'))} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 w-full"
        >
          Ver Recomendaciones
        </button>
        {areas.map((area, index) => (
          <div key={index} className="mb-4 flex flex-wrap items-center w-full">
            <input
              type="text"
              value={area.nombre}
              onChange={(e) => handleAreaChange(index, 'nombre', e.target.value)}
              className="border p-1 mr-2 mb-2 flex-grow"
            />
            <input
              type="number"
              min="0"
              max="10"
              value={area.valor}
              onChange={(e) => handleAreaChange(index, 'valor', parseInt(e.target.value))}
              className="border p-1 w-16 mr-2 mb-2"
            />
            <input
              type="color"
              value={area.color}
              onChange={(e) => handleAreaChange(index, 'color', e.target.value)}
              className="mr-2 mb-2"
            />
            <button onClick={() => removeArea(index)} className="bg-red-500 text-white px-2 py-1 rounded mb-2">
              Eliminar
            </button>
          </div>
        ))}
        <button onClick={addArea} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
          Agregar Área
        </button>
      </div>
    </div>
  );
};

export default RuedaDeLaVida;