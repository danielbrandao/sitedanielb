const coursesGrid = document.querySelector('#courses-grid');
const localCoursesFallback = [
  {
    titulo: 'Fundamentos de Dados para Negócios',
    categoria: 'Curso livre',
    descricao: 'Aprenda a organizar, interpretar e usar dados para tomar decisões melhores no dia a dia das empresas.',
    link: 'https://exemplo.com/inscricao'
  },
  {
    titulo: 'Arquitetura de Software na Prática',
    categoria: 'Pós-graduação',
    descricao: 'Formação aplicada para projetar sistemas robustos, escaláveis e alinhados aos objetivos do negócio.',
    link: 'https://exemplo.com/arquitetura'
  }
];

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
}[character]));

const parseCoursesMarkdown = (markdown) => {
  const courses = [];
  let course = null;

  markdown.split(/\r?\n/).forEach((line) => {
    const field = line.match(/^[-*]?\s*(TITULO|CATEGORIA|DESCRICAO|LINK)\s*:\s*(.*)$/i);

    if (field) {
      if (!course) course = {};
      course[field[1].toLowerCase()] = field[2].trim();
    } else if (line.trim() === '## CURSO' && course) {
      courses.push(course);
      course = {};
    } else if (line.trim() === '## CURSO') {
      course = {};
    }
  });

  if (course) courses.push(course);
  return courses.filter((item) => item.titulo && item.categoria && item.descricao && item.link);
};

const renderCourses = (courses) => {
  if (!coursesGrid) return;

  if (!courses.length) {
    coursesGrid.innerHTML = '<p class="courses-status">Novos cursos serão publicados em breve.</p>';
    return;
  }

  coursesGrid.innerHTML = courses.map((course) => `
    <article class="course-card">
      <span class="course-category">${escapeHtml(course.categoria)}</span>
      <h3>${escapeHtml(course.titulo)}</h3>
      <p>${escapeHtml(course.descricao)}</p>
      <a class="course-link" href="${escapeHtml(course.link)}" target="_blank" rel="noreferrer noopener">
        Acessar curso <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
      </a>
    </article>
  `).join('');
};

const loadCourses = async () => {
  if (!coursesGrid) return;

  if (window.location.protocol === 'file:') {
    renderCourses(localCoursesFallback);
    return;
  }

  try {
    const markdownResponse = await fetch('cursos.md', { cache: 'no-store' });

    if (markdownResponse.ok) {
      renderCourses(parseCoursesMarkdown(await markdownResponse.text()));
      return;
    }

    const jsonResponse = await fetch('cursos.json', { cache: 'no-store' });
    if (!jsonResponse.ok) throw new Error(`Markdown HTTP ${markdownResponse.status}; JSON HTTP ${jsonResponse.status}`);
    const courses = await jsonResponse.json();
    renderCourses(Array.isArray(courses) ? courses : []);
  } catch (error) {
    coursesGrid.innerHTML = '<p class="courses-status">Não foi possível carregar os cursos agora. Tente novamente em instantes.</p>';
    console.error('Erro ao carregar cursos:', error);
  }
};

loadCourses();
