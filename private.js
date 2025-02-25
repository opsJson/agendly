const URL = "https://j3jfvjqrkxzff4bc6cypvq55om0iidng.lambda-url.sa-east-1.on.aws";
let isDragging = false;
let startSelectionState = false;

document.getElementById("calendarContainer").addEventListener("mousedown", handleMouseDown);
document.getElementById("calendarContainer").addEventListener("mouseover", handleMouseOver);
document.addEventListener("mouseup", handleMouseUp);
gerarCalendario();

async function gerarCalendario() {
	const query = window.location.search.substr(1)
	.split("&")
	.reduce((acc, pair) => {
		const [key, value] = pair.split("=");
		acc[key] = decodeURIComponent(value || "");
		return acc;
	}, {});
	let r = await fetch(`${URL}/?user=${query.user}`);
	r = await r.json();
	
	const header = document.getElementById("calendar-header");
	const body = document.getElementById("calendar-body");
	
	// Dias da semana (Domingo a Sábado)
	const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
	
	// Gerar cabeçalho
	let headerRow = "<tr>";
	diasSemana.forEach(dia => {
		headerRow += `<th>${dia}</th>`;
	});
	headerRow += "</tr>";
	header.innerHTML = headerRow;

	// Gerar horários (30 em 30 minutos)
	const horarios = [];
	for(let h = 0; h < 24; h++) {
		for(let m = 0; m < 60; m += 30) {
			horarios.push(
				`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
			);
		}
	}

	// Gerar corpo do calendário
	body.innerHTML = "";
	horarios.forEach(hora => {
		const row = document.createElement("tr");
		diasSemana.forEach((dia, index) => {
			const cell = document.createElement("td");
			const btn = document.createElement("button");
			btn.className = "time-slot";
			btn.textContent = hora;
			btn.dataset.time = hora;
			btn.dataset.day = index;
			cell.appendChild(btn);
			row.appendChild(cell);
		});
		body.appendChild(row);
	});
}

function handleMouseDown(e) {
	if (e.target.classList.contains("time-slot")) {
		isDragging = true;
		startSelectionState = !e.target.classList.contains("selected");
		toggleSlot(e.target);
	}
}

function handleMouseOver(e) {
	if (isDragging && e.target.classList.contains("time-slot")) {
		toggleSlot(e.target);
	}
}

function handleMouseUp() {
	isDragging = false;
}

function toggleSlot(slot) {
	slot.classList.toggle("selected", startSelectionState);
}

function salvarConfiguracao() {
	const config = {
		nome: document.getElementById("barberName").value,
		foto: document.getElementById("barberPhoto").value,
		horarios: {}
	};

	// Coletar horários selecionados
	document.querySelectorAll(".time-slot.selected").forEach(slot => {
		const dayIndex = slot.dataset.day;
		const time = slot.dataset.time;
		const dayName = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][dayIndex];
		
		if (!config.horarios[dayName]) {
			config.horarios[dayName] = [];
		}
		config.horarios[dayName].push(time);
	});

	// Validação
	if (!config.nome || !config.foto) {
		alert("Preencha todos os campos obrigatórios!");
		return;
	}

	// Salvar no localStorage
	localStorage.setItem("barberConfig", JSON.stringify(config));
	alert("Configuração salva com sucesso!");
}

function carregarConfiguracao() {
	const savedConfig = localStorage.getItem("barberConfig");
	if (savedConfig) {
		const config = JSON.parse(savedConfig);
		
		// Preencher campos do perfil
		document.getElementById("barberName").value = config.nome;
		document.getElementById("barberPhoto").value = config.foto;
		
		// Marcar horários selecionados
		Object.entries(config.horarios).forEach(([day, times]) => {
			const dayIndex = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].indexOf(day);
			times.forEach(time => {
				const selector = `.time-slot[data-day="${dayIndex}"][data-time="${time}"]`;
				document.querySelectorAll(selector).forEach(slot => {
					slot.classList.add("selected");
				});
			});
		});
	}
}