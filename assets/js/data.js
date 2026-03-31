window.AuCheiData = (() => {
  const PETS_KEY = 'auchei_pets';
  const PROFILE_KEY = 'auchei_profile';
  const THEME_KEY = 'theme';
  const LOCATION_KEY = 'auchei_location';
  const USERS_KEY = 'auchei_usuarios';
  const SESSION_KEY = 'auchei_sessao';
  const samplePets = [
    { id:'1', type:'lost', name:'Thor', species:'dog', breed:'Golden Retriever', color:'Dourado', size:'G', gender:'Macho', city:'Florianópolis', state:'SC', neighborhood:'Centro', description:'Golden Retriever dócil, usando coleira azul. Desapareceu perto do parque.', reward:500, photo:'🐕', date:'2024-12-20', contactName:'Carlos Souza', contactPhone:'(48) 99888-1234', contactEmail:'carlos@email.com', status:'active', createdAt:'2024-12-20T10:00:00Z' },
    { id:'2', type:'lost', name:'Mia', species:'cat', breed:'Siamês', color:'Bege e marrom', size:'P', gender:'Fêmea', city:'São Paulo', state:'SP', neighborhood:'Vila Mariana', description:'Gata siamesa, olhos azuis, muito tímida. Fugiu pela janela.', reward:300, photo:'🐈', date:'2024-12-22', contactName:'Ana Lima', contactPhone:'(11) 98765-4321', contactEmail:'ana@email.com', status:'active', createdAt:'2024-12-22T14:00:00Z' },
    { id:'3', type:'lost', name:'Bob', species:'dog', breed:'Bulldog Francês', color:'Preto e branco', size:'P', gender:'Macho', city:'Rio de Janeiro', state:'RJ', neighborhood:'Copacabana', description:'Bulldog francês, focinho achatado, muito brincalhão.', reward:0, photo:'🐕', date:'2024-12-23', contactName:'Pedro Santos', contactPhone:'(21) 97654-3210', contactEmail:'pedro@email.com', status:'active', createdAt:'2024-12-23T09:00:00Z' },
    { id:'4', type:'found', name:'Desconhecido', species:'dog', breed:'Vira-lata', color:'Caramelo', size:'M', gender:'Macho', city:'São Paulo', state:'SP', neighborhood:'Pinheiros', description:'Cachorro caramelo encontrado na Rua dos Pinheiros, sem coleira, parece bem cuidado.', reward:0, photo:'🐕', date:'2024-12-21', contactName:'Julia Ferreira', contactPhone:'(11) 91234-5678', contactEmail:'julia@email.com', status:'active', createdAt:'2024-12-21T16:00:00Z' },
    { id:'5', type:'found', name:'Desconhecido', species:'cat', breed:'Persa', color:'Branco', size:'P', gender:'Fêmea', city:'Curitiba', state:'PR', neighborhood:'Batel', description:'Gata persa branca encontrada no condomínio, muito dócil, possivelmente perdida.', reward:0, photo:'🐈', date:'2024-12-24', contactName:'Roberto Alves', contactPhone:'(41) 98877-6655', contactEmail:'roberto@email.com', status:'active', createdAt:'2024-12-24T11:00:00Z' }
  ];
  const defaultProfile = { name:'Maria Silva', email:'maria@email.com', phone:'(11) 99999-1234', city:'São Paulo', state:'SP', avatar:'👤', bio:'Amante de animais e voluntária no AuChei.', joinedAt:'2024-03-15' };

  const defaultUsers = [
    { name:'Maria Silva', email:'maria@email.com', password:'123456', phone:'(11) 99999-1234', city:'São Paulo', state:'SP', avatar:'👤', bio:'Amante de animais e voluntária no AuChei.', joinedAt:'2024-03-15' }
  ];
  const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || 'null') || (localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers)), defaultUsers.slice());
  const saveUsers = users => localStorage.setItem(USERS_KEY, JSON.stringify(users));
  const getSession = () => JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  const isLoggedIn = () => !!getSession();
  const login = (email, password) => {
    const user = getUsers().find(u => String(u.email).toLowerCase() === String(email).toLowerCase() && u.password === password);
    if (!user) return { ok:false, message:'E-mail ou senha inválidos.' };
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email:user.email }));
    saveProfile({ name:user.name, email:user.email, phone:user.phone || '', city:user.city || '', state:user.state || 'SP', avatar:user.avatar || '👤', bio:user.bio || '', joinedAt:user.joinedAt || new Date().toISOString().slice(0,10) });
    return { ok:true, user };
  };
  const registerUser = data => {
    const users = getUsers();
    const email = String(data.email || '').trim().toLowerCase();
    if (users.some(u => String(u.email).toLowerCase() == email)) return { ok:false, message:'Já existe uma conta com esse e-mail.' };
    const user = { name:data.name, email, password:data.password, phone:data.phone || '', city:data.city || '', state:data.state || 'PR', avatar:'🐾', bio:data.bio || 'Novo membro da comunidade AuChei.', joinedAt:new Date().toISOString().slice(0,10) };
    users.unshift(user);
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email:user.email }));
    saveProfile({ name:user.name, email:user.email, phone:user.phone, city:user.city, state:user.state, avatar:user.avatar, bio:user.bio, joinedAt:user.joinedAt });
    return { ok:true, user };
  };
  const logout = () => localStorage.removeItem(SESSION_KEY);

  const notifications = [
    { id:1, title:'Thor foi encontrado!', desc:'O pet foi reunido com sua família em Florianópolis.', time:'há 2 dias', read:false },
    { id:2, title:'Nova busca na sua região', desc:'Um cachorro foi perdido perto de você em São Paulo.', time:'há 5 horas', read:false },
    { id:3, title:'Recompensa atualizada', desc:'A recompensa para Mel foi aumentada para R$ 500.', time:'há 1 dia', read:true }
  ];
  const getPets = () => JSON.parse(localStorage.getItem(PETS_KEY) || 'null') || (localStorage.setItem(PETS_KEY, JSON.stringify(samplePets)), samplePets.slice());
  const savePets = pets => localStorage.setItem(PETS_KEY, JSON.stringify(pets));
  const addPet = pet => {
    const pets = getPets();
    const newPet = { ...pet, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status:'active' };
    pets.unshift(newPet); savePets(pets); return newPet;
  };
  const updatePet = (id, updates) => savePets(getPets().map(p => p.id === id ? { ...p, ...updates } : p));
  const deletePet = id => savePets(getPets().filter(p => p.id !== id));
  const getProfile = () => {
    const session = getSession();
    if (session) {
      const user = getUsers().find(u => String(u.email).toLowerCase() === String(session.email).toLowerCase());
      if (user) return { name:user.name, email:user.email, phone:user.phone || '', city:user.city || '', state:user.state || 'SP', avatar:user.avatar || '👤', bio:user.bio || '', joinedAt:user.joinedAt || '2024-03-15' };
    }
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null') || (localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfile)), defaultProfile);
  };
  const saveProfile = profile => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    const session = getSession();
    if (session) {
      const users = getUsers().map(u => String(u.email).toLowerCase() === String(session.email).toLowerCase() ? { ...u, ...profile } : u);
      saveUsers(users);
    }
  };
  const getTheme = () => localStorage.getItem(THEME_KEY) || 'light';
  const setTheme = theme => localStorage.setItem(THEME_KEY, theme);
  const getLocation = () => localStorage.getItem(LOCATION_KEY) || 'São Paulo, SP';
  const setLocation = value => localStorage.setItem(LOCATION_KEY, value);
  return { notifications, getPets, savePets, addPet, updatePet, deletePet, getProfile, saveProfile, getTheme, setTheme, getLocation, setLocation, getUsers, saveUsers, login, registerUser, logout, isLoggedIn, getSession };
})();
