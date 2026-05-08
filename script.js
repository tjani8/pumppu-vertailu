let rawData = [];

Papa.parse("data.csv", {
  download: true,
  header: true,
  complete: function(results) {
	console.log(results.data);

	rawData = results.data.map(row => ({
	  pumppu: row["Pumppu"],
	  vesi: row["Vesi"],
	  ulko: Number(row["Ulko"]),
	  tuotto: Number(row["Tuotto"]),
	  input: Number(row["Input"]),
	  cop: Number(row["COP"]),
	  huomautus: row["Huomautus"]
	})).filter(r => !isNaN(r.ulko));
	
	console.log(rawData);
	
    initControls();
    updateCharts();
  }
});

function initControls() {

  const pumpSelect = document.getElementById("pumpSelect");
	
  const waterSelect = document.getElementById("waterSelect");

  const pumps = [...new Set(rawData.map(r => r.pumppu))];
  const waters = [...new Set(rawData.map(r => r.vesi))];

  pumps.forEach(p => {
    const option = document.createElement("option");
    option.value = p;
    option.textContent = p;
    pumpSelect.appendChild(option);
  });

  waters.forEach(w => {
    const option = document.createElement("option");
    option.value = w;
    option.textContent = w;
    waterSelect.appendChild(option);
  });

  if (pumpSelect.options.length > 0) {
  pumpSelect.options[0].selected = true;
  }
  
  pumpSelect.addEventListener("change", updateCharts);
  waterSelect.addEventListener("change", updateCharts);
}

function updateCharts() {

  const pumpSelect = document.getElementById("pumpSelect");
  const water = document.getElementById("waterSelect").value;

  const selectedPumps = [...pumpSelect.selectedOptions]
    .map(option => option.value);

  const filtered = rawData
    .filter(r =>
      selectedPumps.includes(r.pumppu) &&
      r.vesi === water
    )
    .sort((a, b) => a.ulko - b.ulko);

  drawCopChart(filtered, water);
  drawPowerChart(filtered, water);
}

function drawCopChart(data, water) {

  const pumps = [...new Set(data.map(d => d.pumppu))];

  const traces = pumps.map(pump => {

    const pumpData = data
      .filter(d => d.pumppu === pump)
      .sort((a, b) => a.ulko - b.ulko);

    return {

      x: pumpData.map(d => d.ulko),
      y: pumpData.map(d => d.cop),

      mode: "lines+markers",

      name: pump,

      hovertemplate:
        "<b>%{fullData.name}</b><br>" +
        "Ulko: %{x}°C<br>" +
        "COP: %{y:.2f}<extra></extra>",

      line: {
        shape: "spline",
        smoothing: 0.6,
        width: 4
      },

      marker: {
        size: 8
      }

    };
  });

  Plotly.newPlot("copChart", traces, {

    dragmode: false,

    title: `COP (${water})`,

    paper_bgcolor: "#1f2937",
    plot_bgcolor: "#1f2937",

    font: {
      color: "white"
    },

    legend: {
      orientation: "h"
    },

    xaxis: {
      title: "Ulkolämpötila °C",
      gridcolor: "#374151"
    },

    yaxis: {
      title: "COP",
      gridcolor: "#374151"
    }

  }, {

    responsive: true,
    displayModeBar: false,
    scrollZoom: false,
    doubleClick: false

  });
}

function drawPowerChart(data, water) {

  const pumps = [...new Set(data.map(d => d.pumppu))];

  const traces = pumps.map(pump => {

    const pumpData = data
      .filter(d => d.pumppu === pump)
      .sort((a, b) => a.ulko - b.ulko);

    return {

      x: pumpData.map(d => d.ulko),
      y: pumpData.map(d => d.tuotto),

      mode: "lines+markers",

      name: pump,

      hovertemplate:
        "<b>%{fullData.name}</b><br>" +
        "Ulko: %{x}°C<br>" +
        "Tuotto: %{y:.1f} kW<extra></extra>",

      line: {
        shape: "spline",
        smoothing: 0.6,
        width: 4
      },

      marker: {
        size: 8
      }

    };
  });

  Plotly.newPlot("powerChart", traces, {

    dragmode: false,

    title: `Tuotto (${water})`,

    paper_bgcolor: "#1f2937",
    plot_bgcolor: "#1f2937",

    font: {
      color: "white"
    },

    legend: {
      orientation: "h"
    },

    xaxis: {
      title: "Ulkolämpötila °C",
      gridcolor: "#374151"
    },

    yaxis: {
      title: "Tuotto kW",
      gridcolor: "#374151"
    }

  }, {

    responsive: true,
    displayModeBar: false,
    scrollZoom: false,
    doubleClick: false

  });
}
