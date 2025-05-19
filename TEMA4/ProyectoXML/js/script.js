const langSelector = document.getElementById('langSelector');
const questionBox  = document.getElementById('question-box');
const prevBtn      = document.getElementById('prevBtn');
const nextBtn      = document.getElementById('nextBtn');
const timerEl      = document.getElementById('timer');
const scoreEl      = document.getElementById('score');

let xmlDoc, questions, current = 0, score = 0, total = 0;
let seconds = 0, timerInterval;

function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;
    const m = String(Math.floor(seconds/60)).padStart(2,'0');
    const s = String(seconds%60).padStart(2,'0');
    timerEl.textContent = `${m}:${s}`;
  }, 1000);
}

function loadXML(lang) {
  clearInterval(timerInterval);
  seconds = 0; timerEl.textContent = '00:00';
  fetch(`xml/${lang === 'es'? 'preguntas_es.xml' : 'questions_en.xml'}`)
    .then(r => r.text())
    .then(str => (new window.DOMParser()).parseFromString(str,'text/xml'))
    .then(doc => {
      xmlDoc = doc;
      questions = Array.from(doc.getElementsByTagName('question'));
      total = questions.length;
      current = 0; score = 0;
      scoreEl.textContent = `Puntuación: ${score} / ${total}`;
      showQuestion();
      startTimer();
    });
}

function showQuestion() {
  const q = questions[current];
  const wording = q.getElementsByTagName('wording')[0].textContent;
  const choices = Array.from(q.getElementsByTagName('choice'));
  questionBox.innerHTML = `
    <div class="question-text">${current+1}. ${wording}</div>
    <div class="choices">
      ${choices.map((c,i)=>
        `<label>
           <input type="radio" name="opt" value="${c.getAttribute('correct')}">
           ${c.textContent}
         </label>`
      ).join('')}
    </div>`;
  prevBtn.disabled = current === 0;
  nextBtn.textContent = current === total-1 ? 'Finalizar' : 'Siguiente';
}

langSelector.addEventListener('change', () => loadXML(langSelector.value));
prevBtn.addEventListener('click', () => {
  if (current>0) current--;
  showQuestion();
});
nextBtn.addEventListener('click', ()=> {
  const sel = document.querySelector('input[name="opt"]:checked');
  if (!sel) { alert('Selecciona una opción.'); return; }
  if (sel.value === 'yes') score++;
  if (current < total-1) {
    current++;
    showQuestion();
  } else {
    clearInterval(timerInterval);
    questionBox.innerHTML = `<h2>¡Has terminado!</h2>
      <p>Tu puntuación: ${score} / ${total}</p>
      <p>Tiempo: ${timerEl.textContent}</p>`;
    nextBtn.disabled = true;
  }
  scoreEl.textContent = `Puntuación: ${score} / ${total}`;
});

// Al cargar la página:
loadXML(langSelector.value);
