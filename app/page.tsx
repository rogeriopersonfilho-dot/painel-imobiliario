"use client"

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react"
import { Building2, Users, Plus, Camera, Phone, User } from "lucide-react"

type Caracteristicas = {
  quartos: number
  suites?: number
  piscina?: boolean
  varanda?: boolean
}

type Imovel = {
  id: string
  titulo: string
  valor: number
  descricao: string
  status: "disponivel"
  fotos: string[]
  caracteristicas: Caracteristicas
}

type Lead = {
  id: string
  nome_cliente: string
  contato: string
  imovel: string
  etapa_funil: string
}

const STORAGE_KEY = "vanessa-almeida-imoveis"

const imoveisIniciais: Imovel[] = [
  {
    id: "1",
    titulo: "Casa Beira-Mar em Arraial d'Ajuda",
    valor: 3500000,
    descricao: "Casa com vista para o mar, área gourmet, 4 quartos e excelente acabamento.",
    status: "disponivel",
    fotos: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80"],
    caracteristicas: { quartos: 4, suites: 4, piscina: true },
  },
  {
    id: "2",
    titulo: "Apartamento Moderno no Centro",
    valor: 750000,
    descricao: "Apartamento com boa localização, varanda e iluminação natural intensa.",
    status: "disponivel",
    fotos: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80"],
    caracteristicas: { quartos: 2, suites: 1, varanda: true },
  },
]

const leadsIniciais: Lead[] = [
  {
    id: "1",
    nome_cliente: "Carlos Silva",
    contato: "(73) 99999-1111",
    imovel: "Casa Beira-Mar em Arraial d'Ajuda",
    etapa_funil: "Novo Contato",
  },
  {
    id: "2",
    nome_cliente: "Mariana Oliveira",
    contato: "mariana@email.com",
    imovel: "Apartamento Moderno no Centro",
    etapa_funil: "Visita Agendada",
  },
]

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Erro ao ler a imagem"))
    reader.readAsDataURL(file)
  })

export default function PainelCorretor() {
  const [abaAtiva, setAbaAtiva] = useState<"imoveis" | "leads">("imoveis")
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [leads, setLeads] = useState<Lead[]>(leadsIniciais)
  const [modalImovelAberto, setModalImovelAberto] = useState(false)

  const [novoTitulo, setNovoTitulo] = useState("")
  const [novoValor, setNovoValor] = useState("")
  const [novaDescricao, setNovaDescricao] = useState("")
  const [novasFotos, setNovasFotos] = useState<string[]>([])

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY)
      if (salvo) {
        const itens = JSON.parse(salvo) as Imovel[]
        setImoveis(itens.length ? itens : imoveisIniciais)
      } else {
        setImoveis(imoveisIniciais)
      }
    } catch {
      setImoveis(imoveisIniciais)
    }
  }, [])

  useEffect(() => {
    if (imoveis.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(imoveis))
    }
  }, [imoveis])

  const handleFotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const arquivos = Array.from(e.target.files || [])
    if (!arquivos.length) return

    try {
      const urls = await Promise.all(arquivos.map(readFileAsDataUrl))
      setNovasFotos((prev) => [...prev, ...urls])
    } catch {
      alert("Não foi possível carregar uma ou mais fotos.")
    } finally {
      e.target.value = ""
    }
  }

  const limparFormularioImovel = () => {
    setNovoTitulo("")
    setNovoValor("")
    setNovaDescricao("")
    setNovasFotos([])
  }

  const handleCadastrarImovel = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!novoTitulo.trim()) return

    const novo: Imovel = {
      id: Date.now().toString(),
      titulo: novoTitulo.trim(),
      valor: Number(novoValor) || 0,
      descricao: novaDescricao.trim() || "Imóvel disponível para visitação e avaliação.",
      status: "disponivel",
      fotos: novasFotos.length ? novasFotos : ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80"],
      caracteristicas: { quartos: 3 },
    }

    setImoveis((prev) => [novo, ...prev])
    limparFormularioImovel()
    setModalImovelAberto(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg">Vanessa Almeida Consultora Imobiliária</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Conectado ao Supabase
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 border-b border-slate-200 pb-4">
          <button
            onClick={() => setAbaAtiva("imoveis")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              abaAtiva === "imoveis"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Meus Imóveis ({imoveis.length})
          </button>
          <button
            onClick={() => setAbaAtiva("leads")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              abaAtiva === "leads"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            Leads / Clientes ({leads.length})
          </button>
        </div>

        {abaAtiva === "imoveis" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Portfólio de Imóveis</h2>
              <button
                onClick={() => setModalImovelAberto(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Novo Imóvel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {imoveis.map((imovel) => (
                <div key={imovel.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative h-48 bg-slate-100">
                    <img src={imovel.fotos[0]} alt={imovel.titulo} className="w-full h-full object-cover" />
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {imovel.status}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-slate-800 mb-2">{imovel.titulo}</h3>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-3">{imovel.descricao}</p>
                    <p className="text-blue-600 font-extrabold text-xl mb-4">
                      {imovel.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                    <div className="flex gap-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
                      <span>🛏️ {imovel.caracteristicas.quartos || 0} Quartos</span>
                      <span>•</span>
                      <span>🏊 {imovel.caracteristicas.piscina ? "Com Piscina" : "Padrão"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {abaAtiva === "leads" && (
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Gestão de Leads e Clientes</h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Contato</th>
                    <th className="p-4">Imóvel de Interesse</th>
                    <th className="p-4">Etapa do Funil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-medium text-slate-800 flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-500" />
                        {lead.nome_cliente}
                      </td>
                      <td className="p-4 text-slate-600 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {lead.contato}
                      </td>
                      <td className="p-4 text-slate-600">{lead.imovel}</td>
                      <td className="p-4">
                        <span className="bg-blue-50 text-blue-700 font-medium px-3 py-1 rounded-full text-xs border border-blue-100">
                          {lead.etapa_funil}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {modalImovelAberto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Cadastrar Novo Imóvel</h3>
            <form onSubmit={handleCadastrarImovel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Título do Imóvel</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cobertura Vista Mar Trancoso"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Descrição</label>
                <textarea
                  rows={4}
                  placeholder="Descreva o imóvel, localização, destaque e características..."
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Valor (R$)</label>
                <input
                  type="number"
                  placeholder="1500000"
                  value={novoValor}
                  onChange={(e) => setNovoValor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fotos (Câmera do Celular)</label>
                <label className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors bg-slate-50">
                  <Camera className="w-8 h-8 text-blue-500 mb-2" />
                  <span className="text-xs font-medium text-slate-600 text-center">
                    Toque para tirar foto ou carregar arquivo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    capture="environment"
                    className="hidden"
                    onChange={handleFotoUpload}
                  />
                </label>

                {novasFotos.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {novasFotos.slice(0, 6).map((foto, index) => (
                      <img key={`${foto}-${index}`} src={foto} alt={`Foto ${index + 1}`} className="h-16 w-full object-cover rounded-lg border border-slate-200" />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    limparFormularioImovel()
                    setModalImovelAberto(false)
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Salvar Imóvel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
