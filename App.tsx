
import React, { useState, useMemo, useRef } from 'react';
import { NEPALI_STRINGS } from './constants';
import { Member, Relation, RelationType } from './types';
import ArchitectureDocs from './components/ArchitectureDocs';
import TreeVisualizer from './components/TreeVisualizer';
import { RelationshipEngine } from './services/RelationshipEngine';

const KINSHIP_OPTIONS = [
  // Direct & Paternal
  { label: 'बुबा/आमा (Parent)', type: RelationType.PARENT, genDiff: -1, isChildOf: true, category: 'प्रत्यक्ष' },
  { label: 'छोरा/छोरी (Child)', type: RelationType.PARENT, genDiff: 1, isChildOf: false, category: 'प्रत्यक्ष' },
  { label: 'दाजु/भाइ/दिदी/बहिनी (Sibling)', type: 'SIBLING', genDiff: 0, category: 'दाजुभाइ/दिदीबहिनी' },
  { label: 'बाजे/बज्यै (Grandparent)', type: RelationType.PARENT, genDiff: -2, isChildOf: true, category: 'बाजेबज्यै' },
  { label: 'नाति/नातिनी (Grandchild)', type: RelationType.PARENT, genDiff: 2, isChildOf: false, category: 'बाजेबज्यै' },
  
  // Marital (Sasurali Side)
  { label: 'श्रीमती/श्रीमान (Spouse)', type: RelationType.SPOUSE, genDiff: 0, category: 'ससुराली तर्फ' },
  { label: 'ससुरा/सासू (In-laws)', type: RelationType.PARENT, genDiff: -1, isChildOf: true, category: 'ससुराली तर्फ' },
  { label: 'जेठान/सालो/साली (Spouse Sibling)', type: 'SPOUSE_SIBLING', genDiff: 0, category: 'ससुराली तर्फ' },
  { label: 'ज्वाइँ/बुहारी (In-law children)', type: RelationType.PARENT, genDiff: 1, isChildOf: false, category: 'ससुराली तर्फ' },

  // Maternal (Mama Side) & Collateral
  { label: 'काका/काकी/फुपू (Uncle/Aunt Paternal)', type: 'UNCLE_AUNT', genDiff: -1, category: 'काका-मामा खलक' },
  { label: 'मामा/माइजु (Maternal Uncle/Aunt)', type: 'UNCLE_AUNT_MATERNAL', genDiff: -1, category: 'काका-मामा खलक' },
  { label: 'ठूलोबुबा/ठूलीआमा (Elder Parent Sibling)', type: 'UNCLE_AUNT', genDiff: -1, category: 'काका-मामा खलक' },
  
  // Extended
  { label: 'भतिजा/भतिजी (Nephew/Niece)', type: 'NEPHEW_NIECE', genDiff: 1, category: 'छोराछोरी तर्फ' },
  { label: 'भान्जा/भान्जी (Maternal Nephew/Niece)', type: 'NEPHEW_NIECE', genDiff: 1, category: 'छोराछोरी तर्फ' },
  { label: 'सम्धी/सम्धिनी (Co-in-laws)', type: 'OTHER', genDiff: 0, category: 'अन्य' },
  { label: 'जेठानी/देवर/नन्द (Spouse Extended)', type: 'OTHER', genDiff: 0, category: 'अन्य' },
];

const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'राम बहादुर', address: 'काठमाडौं', phone: '9841000000', generationLevel: 0, gender: 'MALE', photoUri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ram' },
  { id: '2', name: 'सीता देवी', address: 'काठमाडौं', phone: '9841000001', generationLevel: 0, gender: 'FEMALE', photoUri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sita' },
  { id: '3', name: 'श्याम कुमार', address: 'ललितपुर', phone: '9841000002', generationLevel: 1, gender: 'MALE', photoUri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shyam' },
];

const INITIAL_RELATIONS: Relation[] = [
  { id: 'r1', fromId: '1', toId: '2', type: RelationType.SPOUSE },
  { id: 'r2', fromId: '1', toId: '3', type: RelationType.PARENT },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tree' | 'docs' | 'logic'>('tree');
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [relations, setRelations] = useState<Relation[]>(INITIAL_RELATIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<Member> | null>(null);
  const [relToMemberId, setRelToMemberId] = useState<string>(INITIAL_MEMBERS[0].id);
  const [relTypeIndex, setRelTypeIndex] = useState<number>(0);
  const [memberA, setMemberA] = useState<string>('3');
  const [memberB, setMemberB] = useState<string>('1');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const engine = useMemo(() => new RelationshipEngine(members, relations), [members, relations]);
  const calculatedRelation = useMemo(() => engine.findRelationship(memberA, memberB), [memberA, memberB, engine]);

  const groupedOptions = useMemo(() => {
    const groups: Record<string, typeof KINSHIP_OPTIONS> = {};
    KINSHIP_OPTIONS.forEach(opt => {
      if (!groups[opt.category]) groups[opt.category] = [];
      groups[opt.category].push(opt);
    });
    return groups;
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingMember(prev => ({ ...prev, photoUri: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteMember = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("के तपाईं यो सदस्यलाई वंशावलीबाट हटाउन चाहनुहुन्छ?")) {
      setMembers(prev => prev.filter(m => m.id !== id));
      setRelations(prev => prev.filter(r => r.fromId !== id && r.toId !== id));
    }
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember?.name) return;

    if (editingMember.id) {
      setMembers(prev => prev.map(m => m.id === editingMember.id ? (editingMember as Member) : m));
    } else {
      const newId = Date.now().toString();
      const relOption = KINSHIP_OPTIONS[relTypeIndex];
      const baseMember = members.find(m => m.id === relToMemberId);
      const calculatedGen = (baseMember?.generationLevel ?? 0) + (relOption?.genDiff ?? 0);

      const newMember: Member = {
        ...editingMember,
        id: newId,
        generationLevel: calculatedGen,
        name: editingMember.name ?? '',
        address: editingMember.address ?? '',
        phone: editingMember.phone ?? '',
        gender: editingMember.gender ?? 'MALE',
        photoUri: editingMember.photoUri || `https://api.dicebear.com/7.x/avataaars/svg?seed=${editingMember.name}`
      } as Member;

      setMembers(prev => [...prev, newMember]);

      if (relOption.type === RelationType.PARENT) {
        const from = relOption.isChildOf ? newId : relToMemberId;
        const to = relOption.isChildOf ? relToMemberId : newId;
        setRelations(prev => [...prev, { id: `r_${Date.now()}`, fromId: from, toId: to, type: RelationType.PARENT }]);
      } else if (relOption.type === RelationType.SPOUSE) {
        setRelations(prev => [...prev, { id: `r_${Date.now()}`, fromId: relToMemberId, toId: newId, type: RelationType.SPOUSE }]);
      }
    }
    setIsModalOpen(false);
    setEditingMember(null);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto shadow-2xl bg-white relative">
      <header className="bg-indigo-700 text-white p-6 sticky top-0 z-10 shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">{NEPALI_STRINGS.app_title}</h1>
          <span className="bg-indigo-500 px-3 py-1 rounded-full text-sm font-medium">
            सदस्य संख्या: {members.length}
          </span>
        </div>
      </header>

      <div className="flex border-b bg-white sticky top-[84px] z-10">
        <button onClick={() => setActiveTab('tree')} className={`flex-1 py-4 text-center font-bold transition-all ${activeTab === 'tree' ? 'border-b-4 border-indigo-600 text-indigo-700 bg-indigo-50' : 'text-gray-500 hover:bg-gray-50'}`}> वृक्ष चित्रण </button>
        <button onClick={() => setActiveTab('logic')} className={`flex-1 py-4 text-center font-bold transition-all ${activeTab === 'logic' ? 'border-b-4 border-indigo-600 text-indigo-700 bg-indigo-50' : 'text-gray-500 hover:bg-gray-50'}`}> नाता गणना </button>
        <button onClick={() => setActiveTab('docs')} className={`flex-1 py-4 text-center font-bold transition-all ${activeTab === 'docs' ? 'border-b-4 border-indigo-600 text-indigo-700 bg-indigo-50' : 'text-gray-500 hover:bg-gray-50'}`}> संरचना </button>
      </div>

      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'tree' && (
          <div className="p-4 space-y-4">
            <TreeVisualizer members={members} relations={relations} onNodeClick={(id) => { setEditingMember(members.find(m => m.id === id) || null); setIsModalOpen(true); }} />
            
            <h3 className="text-lg font-bold text-gray-700 mt-6 px-2">सदस्य विवरण</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {members.map(member => (
                <div key={member.id} className="flex items-center p-3 border rounded-xl bg-white shadow-sm group hover:border-indigo-300 transition-all cursor-pointer" onClick={() => { setEditingMember(member); setIsModalOpen(true); }}>
                  <img src={member.photoUri} alt={member.name} className="w-14 h-14 rounded-full border bg-gray-50 mr-4 object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 truncate">{member.name}</h4>
                    <p className="text-[10px] text-gray-400 font-medium">{member.phone || 'फोन छैन'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={(e) => handleDeleteMember(member.id, e)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logic' && (
          <div className="p-6">
            <section className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
              <h2 className="text-xl font-bold mb-6">🔍 नाता पत्ता लगाउनुहोस्</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <select value={memberA} onChange={(e) => setMemberA(e.target.value)} className="w-full p-3 border rounded-xl bg-white shadow-sm">
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <select value={memberB} onChange={(e) => setMemberB(e.target.value)} className="w-full p-3 border rounded-xl bg-white shadow-sm">
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="text-center bg-indigo-600 text-white py-10 rounded-2xl shadow-xl">
                <p className="text-xs uppercase tracking-widest opacity-70 mb-2">Calculated Relationship</p>
                <h3 className="text-4xl font-black">{calculatedRelation}</h3>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'docs' && <ArchitectureDocs />}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-indigo-700 p-4 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">{editingMember?.id ? 'सदस्य सम्पादन' : 'नयाँ सदस्य थप्नुहोस्'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-2xl font-bold">✕</button>
            </div>
            
            <form onSubmit={handleSaveMember} className="p-6 space-y-4 overflow-y-auto no-scrollbar">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img 
                    src={editingMember?.photoUri || 'https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder'} 
                    className="w-28 h-28 rounded-full border-4 border-indigo-50 object-cover shadow-lg" 
                    alt="Profile" 
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold">फोटो परिवर्तन</span>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">नाम (Nepali Name)</label>
                <input required type="text" value={editingMember?.name || ''} onChange={e => setEditingMember(p => ({...p, name: e.target.value}))} className="w-full p-3 border-2 border-gray-100 rounded-xl outline-none focus:border-indigo-500" />
              </div>

              {!editingMember?.id && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <h4 className="text-[10px] font-black text-indigo-800 uppercase mb-3 border-b border-indigo-200 pb-1">नाता सम्बन्ध छनोट</h4>
                  <div className="mb-3">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">कसको नाता?</label>
                    <select value={relToMemberId} onChange={e => setRelToMemberId(e.target.value)} className="w-full p-2.5 border rounded-lg bg-white outline-none">
                      {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-4 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                    {(Object.entries(groupedOptions) as [string, typeof KINSHIP_OPTIONS][]).map(([category, opts]) => (
                      <div key={category} className="mb-2">
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter mb-1">{category}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {opts.map((opt) => {
                            const globalIdx = KINSHIP_OPTIONS.indexOf(opt);
                            return (
                              <button key={globalIdx} type="button" onClick={() => setRelTypeIndex(globalIdx)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border-2 transition-all ${relTypeIndex === globalIdx ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-200'}`}>
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">लिङ्ग</label>
                  <select value={editingMember?.gender || 'MALE'} onChange={e => setEditingMember(p => ({...p, gender: e.target.value as any}))} className="w-full p-3 border-2 border-gray-100 rounded-xl outline-none focus:border-indigo-500">
                    <option value="MALE">पुरुष</option>
                    <option value="FEMALE">महिला</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">फोन नम्बर</label>
                  <input type="tel" value={editingMember?.phone || ''} onChange={e => setEditingMember(p => ({...p, phone: e.target.value}))} className="w-full p-3 border-2 border-gray-100 rounded-xl outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ठेगाना</label>
                <input type="text" value={editingMember?.address || ''} onChange={e => setEditingMember(p => ({...p, address: e.target.value}))} className="w-full p-3 border-2 border-gray-100 rounded-xl outline-none focus:border-indigo-500" />
              </div>

              <div className="pt-6 flex gap-3 sticky bottom-0 bg-white py-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border-2 border-gray-100 text-gray-500 font-bold rounded-xl">रद्द</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">सुरक्षित गर्नुहोस्</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 w-full max-w-4xl bg-white/80 backdrop-blur-md border-t p-4 flex gap-4 z-20">
        <button onClick={() => { setEditingMember({}); setIsModalOpen(true); }} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-xl flex items-center justify-center gap-3 transition-transform active:scale-95">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
          नयाँ सदस्य थप्नुहोस्
        </button>
      </footer>
    </div>
  );
};

export default App;
