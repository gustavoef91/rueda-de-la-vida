import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from "jspdf";

const RuedaDeLaVida = () => {
  const [areas, setAreas] = useState([
    // ... (tus áreas existentes)
  ]);
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const svgRef = useRef(null);

  // ... (resto de tus funciones existentes)

  const downloadPDF = () => {
    const pdf = new jsPDF();
    const svgElement = svgRef.current;
    
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      canvas.width = svgElement.width.baseVal.value * 2;
      canvas.height = svgElement.height.baseVal.value * 2;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = function() {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngData = canvas.toDataURL("image/png");
        
        pdf.setFontSize(20);
        pdf.text("Rueda de la Vida", 105, 15, { align: "center" });
        pdf.setFontSize(12);
        pdf.text(`Nombre: ${nombre}`, 10, 25);
        pdf.text(`Fecha: ${fecha}`, 10, 32);
        pdf.addImage(pngData, 'PNG', 10, 40, 190, 190);
        pdf.save("rueda_de_la_vida.pdf");
      }
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  return (
    <div className="flex flex-col items-center p-4 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center w-full">Rueda de la Vida</h2>
      <div className="flex flex-col items-center w-full max-w-md mb-4">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
          className="border p-2 mb-2 w-full rounded"
        />
        <input
          type="month"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border p-2 mb-2 w-full rounded"
        />
      </div>
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