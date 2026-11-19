<script setup>
import { ref, computed, watch } from 'vue';
import { storyByLocale } from './i18n.js';
import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Church, Clock3, FileText, HeartHandshake, Home, LockKeyhole, MapPin, Menu, MessageCircle, PenLine, Plus, Search, ShieldCheck, Users, Video, X, LogOut, Settings, PlayCircle, Send, Leaf, CircleHelp, PanelLeftClose } from 'lucide-vue-next';

const languageChoices = ['pt-PT','en','es'];
const queryLanguage = new URLSearchParams(window.location.search).get('lang');
const savedLanguage = window.localStorage.getItem('icpc-language');
const locale = ref(languageChoices.includes(queryLanguage) ? queryLanguage : languageChoices.includes(savedLanguage) ? savedLanguage : 'pt-PT');
const story = computed(() => storyByLocale[locale.value] || storyByLocale['pt-PT']);
watch(locale, (lang) => {
  document.documentElement.lang = lang;
  window.localStorage.setItem('icpc-language', lang);
  const url = new URL(window.location.href);
  url.searchParams.set('lang',lang);
  history.replaceState(history.state,'',url.pathname+url.search+url.hash);
}, { immediate: true });

const view = ref('inicio');
const mobileOpen = ref(false);
const role = ref('visitante');
const showAccess = ref(false);
const searchTerm = ref('');
const topic = ref('Todos');
const dashboardTab = ref('visao');
const editorKind = ref('sermao');
const editorTitle = ref('');
const editorReference = ref('');
const editorBody = ref('');
const editorDate = ref('');
const notification = ref('');
const commentText = ref('');
const comments = ref([
  { author: 'Comentário ilustrativo', text: 'Espaço pensado para perguntas e reflexão sobre a Palavra.', time: 'EXEMPLO' }
]);
const sampleSermons = [
  { id: 1, title: 'Perseverança em tempos de provação', passage: 'Tiago 1:2–12', tag: 'Epístola de Tiago', date: 'Exemplo demonstrativo', icon: 'book', color: 'sand' },
  { id: 2, title: 'A graça de Deus na vida diária', passage: 'Efésios 2:8–10', tag: 'Vida cristã', date: 'Exemplo demonstrativo', icon: 'leaf', color: 'sage' },
  { id: 3, title: 'Uma comunidade edificada na Palavra', passage: 'Atos 2:42–47', tag: 'Igreja e comunhão', date: 'Exemplo demonstrativo', icon: 'cross', color: 'rose' }
];
const sampleStudies = [
  { title: 'O que significa ser uma igreja reformada?', detail: 'Introdução aos princípios da Reforma Protestante.', meta: 'Doutrina · 8 min' },
  { title: 'Conhecer a Confissão de Fé de Westminster', detail: 'Um guia acessível para os primeiros passos.', meta: 'Formação · 12 min' },
  { title: 'Como estudar um texto bíblico?', detail: 'Contexto, interpretação e aplicação.', meta: 'Estudo bíblico · 10 min' }
];
const sampleEvents = [
  { date: 'DOM', day: '10h', name: 'Escola Bíblica Dominical', place: 'Programação publicada no site atual', official: true },
  { date: 'DOM', day: '11h', name: 'Culto de Adoração', place: 'Programação publicada no site atual', official: true },
  { date: 'QUA', day: '20h', name: 'Reunião de Oração', place: 'Online · programação publicada', official: true },
  { date: 'DEMO', day: '—', name: 'Encontro de Comunhão', place: 'Evento ilustrativo · data por confirmar', official: false }
];
const additions = ref([]);
const sections = [
  { key: 'inicio', title: 'Início' },
  { key: 'sobre', title: 'A Igreja' },
  { key: 'sermoes', title: 'Sermões' },
  { key: 'estudos', title: 'Estudos' },
  { key: 'agenda', title: 'Agenda' },
  { key: 'comunidade', title: 'Comunidade' }
];
const roles = [
  { key: 'visitante', title: 'Visitante', description: 'Navegar por conteúdo público' },
  { key: 'membro', title: 'Membro', description: 'Área privada e comentários' },
  { key: 'midias', title: 'Equipa de mídias', description: 'Gerir eventos e comunicados' },
  { key: 'pastor', title: 'Pastor', description: 'Gerir todas as áreas do site' }
];
const roleLabel = computed(() => ({ visitante: 'Visitante', membro: 'Membro', midias: 'Equipa de mídias', pastor: 'Pastor' })[role.value]);
const canManage = computed(() => role.value === 'pastor' || role.value === 'midias');
const canComment = computed(() => role.value !== 'visitante');
const filteredSermons = computed(() => [...sampleSermons, ...additions.value.filter(x => x.kind === 'sermao').map((x,i) => ({...x, id:100+i, passage:x.reference || 'Estudo bíblico', date:'Rascunho da sessão', tag:'Rascunho de demonstração', color:'sage'}))].filter(x => (topic.value==='Todos' || x.tag===topic.value) && `${x.title} ${x.passage} ${x.tag}`.toLocaleLowerCase('pt-PT').includes(searchTerm.value.toLocaleLowerCase('pt-PT'))));
const dashboardContent = computed(() => additions.value.filter(x => role.value === 'pastor' || ['evento','noticia'].includes(x.kind)));
function go(key) { view.value=key; mobileOpen.value=false; window.scrollTo({top:0, behavior:'smooth'}); }
function enter(roleKey) { role.value=roleKey; showAccess.value=false; go(roleKey==='visitante'?'inicio':roleKey==='membro'?'comunidade':'dashboard'); dashboardTab.value='visao'; showToast(`Perfil ${roleLabel.value}: demonstração, sem autenticação real.`); }
function showToast(message) { notification.value=message; window.setTimeout(()=>{ if(notification.value===message) notification.value=''; }, 4200); }
function saveDraft() {
  const allowed = role.value==='pastor' || (role.value==='midias' && ['evento','noticia'].includes(editorKind.value));
  if(!allowed) return showToast('Este perfil não pode criar este tipo de conteúdo.');
  if(editorTitle.value.trim().length<4) return showToast('Insira um título com pelo menos 4 caracteres.');
  additions.value.unshift({ id:Date.now(), kind:editorKind.value, title:editorTitle.value.trim(), reference:editorReference.value.trim(), body:editorBody.value.trim(), date:editorDate.value, status:'Rascunho · DEMO' });
  editorTitle.value=''; editorReference.value=''; editorBody.value=''; editorDate.value='';
  dashboardTab.value='conteudos'; showToast('Rascunho criado apenas nesta sessão. Nada foi publicado.');
}
function addComment() { if (!canComment.value) return showAccess.value=true; if (commentText.value.trim().length<3) return showToast('Escreva um comentário antes de enviar.'); comments.value.unshift({author:`${roleLabel.value} (demo)`, text:commentText.value.trim(), time:'AGORA · DEMO'}); commentText.value=''; showToast('Comentário demonstrativo inserido localmente.'); }
function setEditor(kind) { editorKind.value=kind; dashboardTab.value='editor'; }
</script>

<template>
  <div class="site-shell">
    <div class="demo-ribbon"><span class="demo-dot"></span> PROTÓTIPO DE APRESENTAÇÃO <span class="ribbon-divider">·</span> Dados e acessos demonstrativos <span class="ribbon-right">ICPC DIGITAL / V0.1</span></div>
    <header class="header">
      <button class="brand" aria-label="Ir para a página inicial" @click="go('inicio')">
        <span class="logo-mark" aria-hidden="true"><svg viewBox="0 0 54 52" width="42" height="42"><path d="M3 32 19 10l7 10L36 4l16 29-17-9-10 8-6-7Z" fill="#204e40"/><path d="m12 34 13-10 8 8 8-9 9 12" fill="none" stroke="#aac4a7" stroke-width="2"/><path d="M27 25v17m-8-8 8-7 8 7m-13 2 5-4 5 4" fill="none" stroke="#204e40" stroke-width="2.7" stroke-linecap="round"/></svg></span>
        <span class="brand-copy"><strong>ICPC</strong><small>IGREJA CRISTÃ PRESBITERIANA<br>DA COVILHÃ</small></span>
      </button>
      <nav class="desktop-nav" aria-label="Navegação principal"><button v-for="s in sections" :key="s.key" :class="['nav-link',{active:view===s.key}]" @click="go(s.key)">{{s.title}}</button></nav>
      <div class="header-actions"><label class="locale-control"><span class="sr-only">Idioma do site / Website language / Idioma del sitio</span><select v-model="locale" aria-label="Idioma do site / Website language / Idioma del sitio"><option value="pt-PT">PT</option><option value="en">EN</option><option value="es">ES</option></select></label><button class="access-btn" @click="showAccess=true"><LockKeyhole :size="15"/> {{role==='visitante'?'Área reservada':roleLabel}} <ArrowUpRight :size="15"/></button><button class="hamburger" :aria-expanded="mobileOpen" aria-label="Abrir menu" @click="mobileOpen=!mobileOpen"><X v-if="mobileOpen"/><Menu v-else/></button></div>
    </header>
    <nav v-if="mobileOpen" class="mobile-nav" aria-label="Navegação móvel"><button v-for="s in sections" :key="s.key" @click="go(s.key)">{{s.title}} <ArrowRight :size="16"/></button><button v-if="canManage" @click="go('dashboard')">Painel de gestão <ArrowRight :size="16"/></button></nav>

    <main>
      <template v-if="view==='inicio'">
        <section class="hero">
          <div class="hero-copy"><div class="eyebrow light"><span class="line"></span> UMA COMUNIDADE, UMA FÉ, UM PROPÓSITO</div><h1>Uma igreja para <em>caminhar</em> consigo.</h1><p>Uma comunidade de discípulos de Jesus Cristo, firmada na Palavra e nos princípios da Reforma Protestante. Há lugar para si entre nós.</p><div class="hero-actions"><button class="primary-light" @click="go('sobre')">Conheça a nossa igreja <ArrowRight :size="17"/></button><button class="text-light" @click="go('agenda')">Ver a programação <ArrowUpRight :size="16"/></button></div><div class="hero-scripture"><span class="quote-symbol">“</span><span>A igreja fortalecia-se, caminhando no temor do Senhor e na consolação do Espírito Santo.<small>ATOS 9:31 · PARÁFRASE TEMÁTICA</small></span></div></div>
          <div class="hero-art" aria-label="Ilustração das montanhas da Serra da Estrela"><div class="hero-art-label"><span class="mini-cross">✝</span> NA COVILHÃ, JUNTO À SERRA DA ESTRELA</div><svg viewBox="0 0 660 730" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Paisagem artística das montanhas da Serra da Estrela"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9cbbd"/><stop offset="0.56" stop-color="#e9e8d5"/><stop offset="1" stop-color="#f4e1b9"/></linearGradient><linearGradient id="ridge" x1="0" x2="1"><stop offset="0" stop-color="#527567"/><stop offset="1" stop-color="#6e8b77"/></linearGradient></defs><path fill="url(#sky)" d="M0 0h660v730H0z"/><circle cx="475" cy="217" r="105" fill="#f7ebc9" opacity=".94"/><path d="M0 460 155 272l82 125 135-189 168 254 120-146v414H0Z" fill="#849d8b"/><path d="m200 446 175-270 208 303 77-85v336H0V514z" fill="url(#ridge)"/><path d="m309 278 65-103 72 105-34-19-18 14-20-33-30 42Z" fill="#e7eee7" opacity=".87"/><path d="M0 544q120-65 265-12t395-25v223H0Z" fill="#376151"/><path d="M0 600q180-45 359 6t301-36v160H0Z" fill="#163e35"/><path d="M0 665q170-24 336-3t324-8v76H0Z" fill="#0d302b"/><g opacity=".8" fill="#133e32"><path d="m72 590 19-55 21 55h-11l5 38H78l5-38Z"/><path d="m142 606 16-45 15 45h-9l4 31h-21l4-31Z"/><path d="m547 582 24-67 23 67h-14l6 51h-35l6-51Z"/></g></svg><div class="art-note">FÉ • COMUNHÃO • SERVIÇO</div></div>
        </section>
        <section class="quick-info content-width"><div class="quick-label"><span>ENCONTRE-NOS</span><strong>Venha fazer parte.</strong></div><div class="quick-item"><CalendarDays :size="23"/><div><strong>Domingos</strong><span>Escola Bíblica · 10h<br>Culto · 11h</span></div></div><div class="quick-item"><Clock3 :size="23"/><div><strong>Quartas-feiras</strong><span>Reunião de oração<br>20h · Online</span></div></div><button class="round-link" @click="go('agenda')" aria-label="Consultar toda a programação"><ArrowUpRight/></button></section>
        <section class="section intro content-width"><div><div class="eyebrow"><span class="line"></span> SEJA BEM-VINDO</div><h2>Mais do que um lugar.<br><em>Uma família em Cristo.</em></h2></div><div class="intro-right"><p>Na ICPC, pessoas de diferentes histórias e origens reúnem-se para adorar a Deus, crescer no conhecimento das Escrituras e servir a cidade. Quer esteja a descobrir a fé ou à procura de uma comunidade, será bem-vindo.</p><button class="inline-arrow" @click="go('sobre')">A nossa história <ArrowUpRight :size="17"/></button></div></section>
        <section class="feature-grid content-width"><button class="feature-card" @click="go('sermoes')"><span class="feature-icon"><BookOpen :size="24"/></span><span class="feature-num">01 / APRENDER</span><strong>Firmados na Palavra</strong><p>Mensagem bíblica, sermões expositivos e recursos para crescer na fé.</p><span class="feature-arrow"><ArrowUpRight :size="20"/></span></button><button class="feature-card" @click="go('comunidade')"><span class="feature-icon"><Users :size="24"/></span><span class="feature-num">02 / PERTENCER</span><strong>Crescer em comunhão</strong><p>Uma comunidade que partilha a caminhada da vida cristã.</p><span class="feature-arrow"><ArrowUpRight :size="20"/></span></button><button class="feature-card" @click="go('agenda')"><span class="feature-icon"><HeartHandshake :size="24"/></span><span class="feature-num">03 / SERVIR</span><strong>Viver a fé em ação</strong><p>Descubra a nossa programação e formas de participar.</p><span class="feature-arrow"><ArrowUpRight :size="20"/></span></button></section>
        <section class="section soft-section"><div class="content-width"><div class="section-heading"><div><div class="eyebrow"><span class="line"></span> RECURSOS PARA A CAMINHADA</div><h2>Palavra que <em>edifica.</em></h2></div><button class="inline-arrow" @click="go('sermoes')">Explorar sermões <ArrowUpRight :size="17"/></button></div><div class="sermon-grid"><button class="sermon-card" v-for="item in sampleSermons" :key="item.id" @click="go('sermoes')"><div :class="['sermon-cover',item.color]"><BookOpen v-if="item.icon==='book'" :size="62" :stroke-width="1"/><Leaf v-else-if="item.icon==='leaf'" :size="62" :stroke-width="1"/><Church v-else :size="62" :stroke-width="1"/><span class="cover-top">ICPC · RECURSOS</span><span class="cover-demo">TÍTULO ILUSTRATIVO</span></div><div class="sermon-meta">{{item.tag}} <span>· DEMO</span></div><h3>{{item.title}}</h3><p>{{item.passage}}</p><div class="card-bottom">Ler mais <ArrowUpRight :size="16"/></div></button></div></div></section>
        <section class="closing-banner content-width"><div><span class="eyebrow light">A NOSSA PORTA ESTÁ ABERTA</span><h2>Será um prazer<br><em>recebê-lo.</em></h2></div><button class="primary-light" @click="go('agenda')">Preparar a minha visita <ArrowRight :size="18"/></button></section>
      </template>

      <template v-else-if="view==='sobre'"><section class="page-hero"><div class="content-width"><div class="eyebrow"><span class="line"></span> CONHEÇA A ICPC</div><h1>Uma história de <em>fé e comunhão.</em></h1><p>A Igreja Cristã Presbiteriana da Covilhã é uma comunidade de tradição reformada, comprometida com a Escritura, a adoração e a vida comunitária.</p></div></section><section class="content-width prose-grid section about-content">
  <article class="prose-card">
    <span class="eyebrow">{{story.identity}}</span>
    <h2>{{story.doctrineTitle}}</h2>
    <p>{{story.doctrineIntro}}</p>
    <p>{{story.doctrineWorship}}</p>
    <h3 class="story-subtitle">{{story.worshipTitle}}</h3>
    <ol class="worship-list"><li v-for="item in story.worship" :key="item">{{item}}</li></ol>
  </article>
  <article class="prose-card light-card">
    <span class="eyebrow">{{story.historyEyebrow}}</span>
    <h2>{{story.historyTitle}}</h2>
    <p v-for="(paragraph,i) in story.historyParagraphs" :key="i">{{paragraph}}</p>
  </article>
</section>
<figure class="content-width story-photo">
  <img src="https://www.presbiterianos-covilha.pt/assets/foto_igreja.jpg" :alt="story.historyPhoto" width="1000" height="462" loading="lazy" decoding="async" referrerpolicy="no-referrer">
  <figcaption>{{story.photoCredit}} · <a href="https://www.presbiterianos-covilha.pt/about.htm" target="_blank" rel="noopener noreferrer">{{story.historySource}}</a></figcaption>
</figure>
<section class="content-width section leadership">
  <div class="eyebrow"><span class="line"></span> {{story.leadershipEyebrow}}</div>
  <h2>{{story.leadershipTitle}}</h2>
  <div class="leadership-grid">
    <div><h3 class="leadership-title">{{story.presbytery}}</h3><strong>Rev. Luiz AC Bueno</strong><span>Pb. André Rios de Freitas</span><span>Pb. Geraldo Cangondo</span></div>
    <div><h3 class="leadership-title">{{story.diaconate}}</h3><strong>Dc. J. Patrício da Silva</strong><span>Dc. Isaque Oliveira</span><span>Dc. Ivan Azevedo</span><span>Dc. Leandro Atallah</span><span>Dc. Hagamenon Nicolau</span></div>
  </div>
  <p class="source-note">{{story.peopleSource}}</p></section></template>

      <template v-else-if="view==='sermoes'"><section class="page-hero"><div class="content-width"><div class="eyebrow"><span class="line"></span> ENSINO E PREGAÇÃO</div><h1>A Palavra que <em>transforma.</em></h1><p>Explore mensagens e séries bíblicas. As entradas abaixo são exemplos de como a biblioteca poderá funcionar.</p></div></section><section class="content-width section library"><div class="library-toolbar"><label class="searchbox"><Search :size="20"/><input type="search" v-model="searchTerm" placeholder="Pesquisar passagem, tema ou mensagem..."/></label><label class="filterbox">Tema <select v-model="topic"><option>Todos</option><option>Epístola de Tiago</option><option>Vida cristã</option><option>Igreja e comunhão</option></select><ChevronDown :size="16"/></label></div><div class="sermon-grid"><article v-for="s in filteredSermons" :key="s.id" class="sermon-card"><div :class="['sermon-cover',s.color]"><BookOpen :size="62" :stroke-width="1"/><span class="cover-top">ICPC · BIBLIOTECA</span><span class="cover-demo">DEMONSTRAÇÃO</span></div><div class="sermon-meta">{{s.tag}} · DEMO</div><h3>{{s.title}}</h3><p>{{s.passage}}</p><button class="card-bottom" @click="showToast('O vídeo/áudio real será integrado após autorização da igreja.')">Ver detalhe <ArrowUpRight :size="16"/></button></article></div><div v-if="filteredSermons.length===0" class="empty-state">Nenhum conteúdo encontrado para esta pesquisa.</div></section></template>

      <template v-else-if="view==='estudos'"><section class="page-hero"><div class="content-width"><div class="eyebrow"><span class="line"></span> CRESCER NO CONHECIMENTO</div><h1>Estudar. Refletir. <em>Viver.</em></h1><p>Um espaço para estudos bíblicos, artigos e materiais de formação cristã.</p></div></section><section class="content-width section"><div class="resource-list"><article class="resource-row" v-for="(s,i) in [...sampleStudies,...additions.filter(x=>x.kind==='estudo'||x.kind==='artigo').map(x=>({title:x.title, detail:x.body||'Rascunho criado nesta sessão.',meta:'Rascunho · DEMO'}))]" :key="i"><div class="resource-number">{{String(i+1).padStart(2,'0')}}</div><div><small>{{s.meta}}</small><h3>{{s.title}}</h3><p>{{s.detail}}</p></div><button class="round-link" @click="showToast('Leitura integral disponível na fase CMS.')" aria-label="Abrir estudo"><ArrowUpRight/></button></article></div></section></template>

      <template v-else-if="view==='agenda'"><section class="page-hero"><div class="content-width"><div class="eyebrow"><span class="line"></span> A VIDA DA COMUNIDADE</div><h1>Há sempre um lugar<br><em>para estar connosco.</em></h1><p>Horários publicados pela igreja e exemplos de eventos futuros para demonstrar a agenda.</p></div></section><section class="content-width section"><div class="calendar-head"><h2>Programação e encontros</h2><span class="tag"><CalendarDays :size="15"/> Horários sujeitos a confirmação</span></div><div class="event-list"><article class="event-row" v-for="(ev,i) in [...sampleEvents,...additions.filter(x=>x.kind==='evento').map(x=>({date:'DEMO',day:'—',name:x.title,place:x.date||'Rascunho demonstrativo',official:false}))]" :key="i"><div class="date-square"><small>{{ev.date}}</small><strong>{{ev.day}}</strong></div><div class="event-main"><span class="small-uppercase">{{ev.official?'PROGRAMAÇÃO PUBLICADA':'EVENTO DEMONSTRATIVO'}}</span><h3>{{ev.name}}</h3><p><MapPin :size="14"/> {{ev.place}}</p></div><span :class="['status-pill',{muted:!ev.official}]">{{ev.official?'Semanal':'Exemplo'}}</span></article></div></section></template>

      <template v-else-if="view==='comunidade'"><section class="page-hero"><div class="content-width"><div class="eyebrow"><span class="line"></span> CAMINHAMOS JUNTOS</div><h1>Comunhão que <em>acolhe.</em></h1><p>Descubra o espaço pensado para a participação, o cuidado e a vida da comunidade.</p></div></section><section class="section content-width"><div class="community-grid"><article class="community-panel"><span class="eyebrow">ESPAÇO RESERVADO</span><h2>A nossa comunidade, também online.</h2><p>Os membros poderão consultar avisos internos, conteúdos exclusivos e participar em conversas moderadas.</p><div v-if="role==='visitante'" class="notice"><LockKeyhole :size="20"/> Esta área requer acesso autorizado pela igreja.</div><div v-else class="notice success"><ShieldCheck :size="20"/> Está a visualizar a área privada como <strong>{{roleLabel}}</strong> (demonstração).</div><button v-if="role==='visitante'" class="primary-dark" @click="showAccess=true">Explorar acesso de membro <ArrowRight :size="17"/></button><button v-else class="inline-arrow" @click="showToast('Avisos e ficheiros internos serão disponibilizados no MVP.')">Ver comunicados internos <ArrowRight :size="16"/></button></article><article class="community-panel warm-panel"><span class="eyebrow">PARTILHA E EDIFICAÇÃO</span><h2>Conversar com respeito.</h2><p>Os comentários terão moderação para promover conversas saudáveis e a segurança de todos.</p><div class="comments"><div class="comment" v-for="(c,i) in comments" :key="i"><span class="avatar">{{c.author.slice(0,1)}}</span><div><strong>{{c.author}} <small>{{c.time}}</small></strong><p>{{c.text}}</p></div></div></div><form v-if="canComment" class="comment-form" @submit.prevent="addComment"><label for="comment">O seu comentário (apenas nesta sessão)</label><textarea id="comment" v-model="commentText" placeholder="Escreva a sua reflexão..." rows="2"></textarea><button class="primary-dark" type="submit">Enviar comentário demo <Send :size="16"/></button></form><button v-else class="inline-arrow" @click="showAccess=true">Entre para comentar <ArrowRight :size="17"/></button></article></div></section></template>

      <template v-else-if="view==='dashboard' && canManage"><section class="dashboard-wrap content-width"><aside class="dashboard-sidebar"><div class="dashboard-sidebar-top"><small>PAINEL DE GESTÃO</small><h2>{{role==='pastor'?'Área pastoral':'Equipa de mídias'}}</h2><div class="role-chip"><ShieldCheck :size="15"/> {{roleLabel}} · MODO DEMO</div></div><nav aria-label="Menu do painel"><button :class="{selected:dashboardTab==='visao'}" @click="dashboardTab='visao'"><Home :size="18"/> Visão geral</button><button :class="{selected:dashboardTab==='conteudos'}" @click="dashboardTab='conteudos'"><FileText :size="18"/> Conteúdos</button><button :class="{selected:dashboardTab==='editor'}" @click="dashboardTab='editor'"><PenLine :size="18"/> Criar publicação</button><button v-if="role==='pastor'" :class="{selected:dashboardTab==='acessos'}" @click="dashboardTab='acessos'"><Users :size="18"/> Utilizadores e acessos</button><button @click="go('inicio')"><ChevronLeft :size="18"/> Voltar ao site</button></nav><div class="dashboard-tip"><CircleHelp :size="18"/> Este painel simula o CMS. Nenhuma ação altera o site real.</div></aside><div class="dashboard-main"><div class="dashboard-topline"><div><small>PAINEL / {{dashboardTab==='visao'?'VISÃO GERAL':dashboardTab==='conteudos'?'CONTEÚDOS':dashboardTab==='editor'?'EDITOR':'ACESSOS'}}</small><h1>{{dashboardTab==='visao'?'Bem-vindo ao painel':dashboardTab==='conteudos'?'Gestão de publicações':dashboardTab==='editor'?'Criar uma publicação':'Gestão de acessos'}}</h1></div><div class="role-avatar">{{role==='pastor'?'P':'M'}}</div></div><template v-if="dashboardTab==='visao'"><p class="dashboard-summary">Tudo o que precisa para comunicar com a comunidade, num único lugar. <strong>Ambiente exclusivamente demonstrativo.</strong></p><div class="stats-grid"><div><span>Áreas disponíveis</span><strong>{{role==='pastor'?'06':'02'}}</strong><small>Consoante o seu perfil</small></div><div><span>Rascunhos criados</span><strong>{{dashboardContent.length}}</strong><small>Nesta sessão</small></div><div><span>Comentários demo</span><strong>{{comments.length}}</strong><small>Visíveis em Comunidade</small></div></div><div class="dashboard-actions"><button @click="setEditor(role==='pastor'?'sermao':'evento')"><span class="action-icon"><Plus/></span><strong>{{role==='pastor'?'Novo sermão':'Novo evento'}}</strong><small>Criar um rascunho</small><ArrowUpRight :size="18"/></button><button @click="setEditor(role==='pastor'?'estudo':'noticia')"><span class="action-icon"><PenLine/></span><strong>{{role==='pastor'?'Novo estudo bíblico':'Novo comunicado'}}</strong><small>Adicionar conteúdo</small><ArrowUpRight :size="18"/></button></div><div class="editorial-note"><ShieldCheck :size="22"/><div><strong>Segurança e aprovação editorial</strong><p>Na versão final, o Auth0 identificará os utilizadores e a API FastAPI validará todas as permissões. A publicação de conteúdos doutrinários poderá exigir aprovação pastoral.</p></div></div></template><template v-else-if="dashboardTab==='conteudos'"><div class="table-head"><h2>Rascunhos da sessão</h2><button class="primary-dark" @click="dashboardTab='editor'"><Plus :size="17"/> Criar novo</button></div><div v-if="dashboardContent.length" class="dashboard-content-list"><article v-for="item in dashboardContent" :key="item.id"><FileText :size="21"/><div><strong>{{item.title}}</strong><small>{{item.kind}} · {{item.status}}</small></div><span class="draft-badge">RASCUNHO</span></article></div><div v-else class="empty-state"><FileText :size="34"/><h3>Ainda não há rascunhos</h3><p>Crie uma publicação para demonstrar o fluxo editorial.</p><button class="inline-arrow" @click="dashboardTab='editor'">Começar agora <ArrowRight :size="17"/></button></div></template><template v-else-if="dashboardTab==='editor'"><div class="editor-card"><div class="editor-caption">EDITOR DE CONTEÚDO · DEMONSTRAÇÃO</div><form class="editor-form" @submit.prevent="saveDraft"><label for="content-type">Tipo de publicação</label><select id="content-type" v-model="editorKind"><option v-if="role==='pastor'" value="sermao">Sermão</option><option v-if="role==='pastor'" value="estudo">Estudo bíblico</option><option v-if="role==='pastor'" value="artigo">Artigo</option><option value="evento">Evento</option><option value="noticia">Comunicado / notícia</option></select><label for="content-title">Título</label><input id="content-title" v-model="editorTitle" placeholder="Ex.: Encontro de famílias" maxlength="120" required/><label for="content-reference">{{editorKind==='sermao'||editorKind==='estudo'?'Referência bíblica':'Categoria / local'}} (opcional)</label><input id="content-reference" v-model="editorReference" placeholder="Ex.: Tiago 1:2–12"/><template v-if="editorKind==='evento'"><label for="content-date">Data do evento (opcional)</label><input id="content-date" type="date" v-model="editorDate"/></template><label for="content-body">Descrição / conteúdo</label><textarea id="content-body" v-model="editorBody" rows="6" placeholder="Escreva um resumo ou os detalhes da publicação..."></textarea><div class="editor-footer"><span><LockKeyhole :size="15"/> Apenas uma simulação, sem publicação real</span><button type="submit" class="primary-dark">Guardar rascunho <Check :size="17"/></button></div></form></div></template><template v-else-if="dashboardTab==='acessos' && role==='pastor'"><div class="editorial-note"><ShieldCheck :size="22"/><div><strong>Gestão de membros e utilizadores</strong><p>No MVP, o pastor poderá aprovar membros, gerir permissões, rever acessos e consultar auditoria de alterações. Nesta demonstração não são usados nomes ou informações reais de pessoas.</p></div></div><div class="permission-demo"><div><strong>Pastor</strong><span>Controlo integral da aplicação</span><Check :size="19"/></div><div><strong>Equipa de mídias</strong><span>Eventos e notícias, sem gestão de acessos</span><Check :size="19"/></div><div><strong>Membro</strong><span>Área privada e comentários</span><Check :size="19"/></div></div></template></div></section></template>
    </main>

    <footer class="footer"><div class="content-width footer-top"><div class="footer-about"><div class="footer-logo">ICPC <span>✝</span></div><p>Igreja Cristã Presbiteriana da Covilhã.<br>Firmados na Palavra, unidos em Cristo.</p><small>Protótipo sujeito à aprovação da liderança da igreja.</small></div><div class="footer-links"><strong>Explorar</strong><button @click="go('sobre')">A Igreja</button><button @click="go('sermoes')">Sermões</button><button @click="go('estudos')">Estudos bíblicos</button><button @click="go('agenda')">Programação</button></div><div class="footer-links"><strong>Participe</strong><button @click="go('comunidade')">Comunidade</button><button @click="showAccess=true">Área reservada</button><a href="https://www.presbiterianos-covilha.pt/index.htm" target="_blank" rel="noopener noreferrer">Site oficial atual <ArrowUpRight :size="14"/></a></div><div class="footer-verse"><BookOpen :size="26"/><p>“Acolhemos a todos os que desejam viver segundo os princípios do evangelho de Nosso Senhor.”</p><small>APRESENTAÇÃO DA ICPC</small></div></div><div class="content-width footer-bottom"><span>© ICPC Digital · Protótipo de apresentação</span><span>DESENVOLVIDO COM CUIDADO PARA A COMUNIDADE <span class="foot-cross">✝</span></span></div></footer>

    <div v-if="showAccess" class="modal-backdrop" @click.self="showAccess=false"><section class="access-modal" role="dialog" aria-modal="true" aria-labelledby="access-title"><button class="modal-close" aria-label="Fechar" @click="showAccess=false"><X :size="22"/></button><div class="eyebrow"><span class="line"></span> EXPLORAR O PROTÓTIPO</div><h2 id="access-title">Como gostaria de<br><em>visualizar o site?</em></h2><p>Escolha um perfil para experimentar as funcionalidades previstas. <strong>Não é um login real.</strong></p><div class="role-options"><button v-for="r in roles" :key="r.key" @click="enter(r.key)"><span class="role-option-icon"><Users v-if="r.key==='membro'" :size="19"/><ShieldCheck v-else-if="r.key==='pastor'" :size="19"/><PenLine v-else-if="r.key==='midias'" :size="19"/><Home v-else :size="19"/></span><span><strong>{{r.title}}</strong><small>{{r.description}}</small></span><ArrowRight :size="19"/></button></div><div class="modal-note"><LockKeyhole :size="16"/> A autenticação Auth0 e a base de dados serão integradas na fase MVP.</div></section></div>
    <div v-if="notification" role="status" class="toast"><Check :size="18"/> {{notification}} <button @click="notification=''" aria-label="Fechar notificação"><X :size="17"/></button></div>
  </div>
</template>