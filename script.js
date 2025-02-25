const URL = "https://j3jfvjqrkxzff4bc6cypvq55om0iidng.lambda-url.sa-east-1.on.aws";
const query = window.location.search.substr(1)
	.split("&")
	.reduce((acc, pair) => {
		const [key, value] = pair.split("=");
		acc[key] = decodeURIComponent(value || "");
		return acc;
	}, {});
gerarCalendario();

function diaSemana(dataStr) {
	const partes = dataStr.split("/");
	if (partes.length !== 2) return "Formato inválido";
	
	const dia = parseInt(partes[0], 10);
	const mes = parseInt(partes[1], 10);
	if (isNaN(dia) || isNaN(mes)) return "Data inválida";
	
	const ano = new Date().getFullYear();
	const data = new Date(ano, mes - 1, dia);
	if (data.getMonth() !== mes - 1 || data.getDate() !== dia) return "Data inválida";
	
	const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
	return diasSemana[data.getDay()];
}

async function gerarCalendario() {
	let r = await fetch(`${URL}/?user=${query.user}`);
	r = await r.json();
	
	document.getElementById("name").innerText = r.name;
	document.getElementById("photo").src = r.photo;
	
	const ths = ordenarDatas(Object.keys(r.availableSchedules || {})).map(schedule => `<th>${diaSemana(schedule)} - ${schedule}</th>`);
	document.getElementById("calendar-header").innerHTML = `<tr>${ths.join("")}</tr>`;
	
	let btns = "";
	for (const scheduleDay of ordenarDatas(Object.keys(r.availableSchedules || {}))) {
		btns += "<td><div class='time-slots'>";
		for (const scheduleTime of r.availableSchedules[scheduleDay]) {
			btns += `<button class="time-btn" 
							onclick="selecionarHorario(this)"
							data-scheduleday="${scheduleDay}"
							data-scheduletime="${scheduleTime}">
						${scheduleTime}
					</button>`;
		}
		btns += "</div></td>";
	}
	document.getElementById("calendar-body").innerHTML = `<tr>${btns}</tr>`;
}

function selecionarHorario(botao) {
	document.querySelectorAll(".time-btn").forEach(btn => btn.classList.remove("selected-time"));
	botao.classList.add("selected-time");
	
	document.getElementById("dados-cliente").style.display = "block";
	document.getElementById("confirmacao").style.display = "block";
	
	document.getElementById("nome").value = localStorage.getItem("nome") || "";
	document.getElementById("whatsapp").value = localStorage.getItem("whatsapp") || "";
}

async function confirmarAgendamento() {
	const nome = document.getElementById("nome").value;
	const whatsapp = document.getElementById("whatsapp").value;
	const date = document.querySelector(".selected-time").dataset.scheduleday;
	const time = document.querySelector(".selected-time").dataset.scheduletime;

	if(!nome || !whatsapp) {
		alert("Por favor, preencha todos os dados!");
		return;
	}
	
	localStorage.setItem("nome", nome);
	localStorage.setItem("whatsapp", whatsapp);
	
	let r = await fetch(`${URL}/schedule?user=${query.user}&name=${nome}&whatsapp=${whatsapp}&date=${date}&time=${time}`);
	if (r.status != 200) {
		alert("Erro ao agendar!");
		return;
	}

	const mensagem = `Agendamento confirmado!\n\nNome: ${nome}\nWhatsApp: ${whatsapp}\nData: ${date} ${time}`;
	alert(mensagem);
	
	// Resetar o formulário
	document.querySelectorAll(".selected-time").forEach(el => el.classList.remove("selected-time"));
	document.getElementById("dados-cliente").style.display = "none";
	document.getElementById("confirmacao").style.display = "none";
	document.getElementById("nome").value = "";
	document.getElementById("whatsapp").value = "";
}

function ordenarDatas(arr) {
    return arr.sort((a, b) => {
        // Divide as strings em dia e mês e converte para números
        const [diaA, mesA] = a.split('/').map(Number);
        const [diaB, mesB] = b.split('/').map(Number);
        
        // Compara os meses primeiro
        if (mesA !== mesB) {
            return mesA - mesB;
        } else {
            // Se os meses forem iguais, compara os dias
            return diaA - diaB;
        }
    });
}