"use client"

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react"
import {
  Building2,
  Users,
  Plus,
  Camera,
  Phone,
  User,
  X,
  Trash2,
  Pencil,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

type Caracteristicas = {
  quartos: number
  suites?: number
  piscina?: boolean
  varanda?: boolean
}

type Proprietario = {
  id: string
  nome: string
  telefone: string
  email: string
  endereco: string
  observacoes: string
}

type Imovel = {
  id: string
  titulo: string
  valor: number
  descricao: string
  status: "disponivel"
  fotos: string[]
  caracteristicas: Caracteristicas
  proprietarioId?: string
}

type Lead = {
  id: string
  nome_cliente: string
  contato: string
  imovel: string
  etapa_funil: string
}

const STORAGE_KEY = "vanessa-almeida-imoveis"
const STORAGE_PROPRIETARIOS_KEY = "vanessa-almeida-proprietarios"

const proprietariosIniciais: Proprietario[] = [
  {
    id: "p1",
    nome: "Maria Oliveira",
    telefone: "(73) 98888-0001",
    email: "mariaoliveira@email.com",
    endereco: "Rua das Flores, 120, Porto Seguro",
    observacoes: "Proprietária ativa e prioritária em imóveis de praia.",
  },
  {
    id: "p2",
    nome: "João Pereira",
    telefone: "(73) 98888-0002",
    email: "joao.pereira@email.com",
    endereco: "Avenida Central, 65, Arraial d'Ajuda",
    observacoes: "Proprietário de imóveis em área central.",
  },
]

const imoveisIniciais: Imovel[] = [
  {
    id: "1",
    titulo: "Casa Beira-Mar em Arraial d'Ajuda",
    valor: 3500000,
    descricao: "Casa com vista para o mar, área gourmet, 4 quartos e excelente acabamento.",
    status: "disponivel",
    fotos: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
    ],
    caracteristicas: { quartos: 4, suites: 4, piscina: true },
    proprietarioId: "p1",
  },
  {
    id: "2",
    titulo: "Apartamento Moderno no Centro",
    valor: 750000,
    descricao: "Apartamento com boa localização, varanda e iluminação natural intensa.",
    status: "disponivel",
    fotos: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80",
    ],
    caracteristicas: { quartos: 2, suites: 1, varanda: true },
    proprietarioId: "p2",
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

const getSafeImoveis = (valor: unknown): Imovel[] => {
  if (!Array.isArray(valor)) return []

  return valor.filter((item): item is Imovel => {
    if (!item || typeof item !== "object") return false
    const current = item as Partial<Imovel>
    return (
      typeof current.id === "string" &&
      typeof current.titulo === "string" &&
      typeof current.valor === "number" &&
      Array.isArray(current.fotos) &&
      typeof current.descricao === "string"
    )
  })
}

const getSafeProprietarios = (valor: unknown): Proprietario[] => {
  if (!Array.isArray(valor)) return []

  return valor.filter((item): item is Proprietario => {
    if (!item || typeof item !== "object") return false
    const current = item as Partial<Proprietario>
    return (
      typeof current.id === "string" &&
      typeof current.nome === "string" &&
      typeof current.telefone === "string"
    )
  })
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Erro ao ler a imagem"))
    reader.readAsDataURL(file)
  })

export default function PainelCorretor() {
  const [abaAtiva, setAbaAtiva] = useState<"imoveis" | "proprietarios" | "leads">("imoveis")
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([])
  const [leads, setLeads] = useState<Lead[]>(leadsIniciais)
  const [modalImovelAberto, setModalImovelAberto] = useState(false)
  const [modalProprietarioAberto, setModalProprietarioAberto] = useState(false)
  const [modalDetalheImovelAberto, setModalDetalheImovelAberto] = useState(false)
  const [imovelSelecionado, setImovelSelecionado] = useState<Imovel | null>(null)
  const [fotoAtualIndex, setFotoAtualIndex] = useState(0)
  const [modoEdicaoImovel, setModoEdicaoImovel] = useState(false)
  const [imovelEditandoId, setImovelEditandoId] = useState<string | null>(null)

  const [novoTitulo, setNovoTitulo] = useState("")
  const [novoValor, setNovoValor] = useState("")
  const [novaDescricao, setNovaDescricao] = useState("")
  const [novaProprietarioId, setNovaProprietarioId] = useState("")
  const [novasFotos, setNovasFotos] = useState<string[]>([])

  const [novoPropNome, setNovoPropNome] = useState("")
  const [novoPropTelefone, setNovoPropTelefone] = useState("")
  const [novoPropEmail, setNovoPropEmail] = useState("")
  const [novoPropEndereco, setNovoPropEndereco] = useState("")
  const [novoPropObservacoes, setNovoPropObservacoes] = useState("")

  useEffect(() => {
    try {
      const imoveisSalvos = localStorage.getItem(STORAGE_KEY)
      const proprietariosSalvos = localStorage.getItem(STORAGE_PROPRIETARIOS_KEY)

      if (imoveisSalvos) {
        const parsed = JSON.parse(imoveisSalvos)
        const validos = getSafeImoveis(parsed)
        setImoveis(validos.length ? validos : imoveisIniciais)
      } else {
        setImoveis(imoveisIniciais)
      }

      if (proprietariosSalvos) {
        const parsed = JSON.parse(proprietariosSalvos)
        const validos = getSafeProprietarios(parsed)
        setProprietarios(validos.length ? validos : proprietariosIniciais)
      } else {
        setProprietarios(proprietariosIniciais)
      }
    } catch {
      setImoveis(imoveisIniciais)
      setProprietarios(proprietariosIniciais)
    }
  }, [])

  useEffect(() => {
    if (imoveis.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(imoveis))
    }
  }, [imoveis])

  useEffect(() => {
    if (proprietarios.length > 0) {
      localStorage.setItem(STORAGE_PROPRIETARIOS_KEY, JSON.stringify(proprietarios))
    }
  }, [proprietarios])

  useEffect(() => {
    setFotoAtualIndex(0)
  }, [imovelSelecionado?.id])

  const obterNomeProprietario = (proprietarioId?: string) => {
    if (!proprietarioId) return "Sem proprietário"
    const prop = proprietarios.find((item) => item.id === proprietarioId)
    return prop?.nome ?? "Sem proprietário"
  }

  const limparFormularioImovel = () => {
    setNovoTitulo("")
    setNovoValor("")
    setNovaDescricao("")
    setNovaProprietarioId(proprietarios[0]?.id ?? "")
    setNovasFotos([])
    setModoEdicaoImovel(false)
    setImovelEditandoId(null)
  }

  const abrirFormularioNovoImovel = () => {
    limparFormularioImovel()
    setModalImovelAberto(true)
  }

  const abrirFormularioEdicaoImovel = (imovel: Imovel) => {
    setModoEdicaoImovel(true)
    setImovelEditandoId(imovel.id)
    setNovoTitulo(imovel.titulo)
    setNovoValor(String(imovel.valor))
    setNovaDescricao(imovel.descricao)
    setNovaProprietarioId(imovel.proprietarioId ?? "")
    setNovasFotos(imovel.fotos)
    setModalImovelAberto(true)
  }

  const handleFotoUpload = async (e: ChangeEvent<HTMLInputElement>, multiple = true) => {
    const arquivos = Array.from(e.target.files || [])
    if (!arquivos.length) return

    try {
      const selecionadas = multiple ? arquivos : arquivos.slice(0, 1)
      const urls = await Promise.all(selecionadas.map(readFileAsDataUrl))
      setNovasFotos((prev) => Array.from(new Set([...prev, ...urls])))
    } catch {
      alert("Não foi possível carregar uma ou mais fotos.")
    } finally {
      e.target.value = ""
    }
  }

  const removerFotoSelecionada = (foto: string) => {
    setNovasFotos((prev) => prev.filter((item) => item !== foto))
  }

  const handleCadastrarImovel = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!novoTitulo.trim()) return

    const payload: Imovel = {
      id: modoEdicaoImovel && imovelEditandoId ? imovelEditandoId : Date.now().toString(),
      titulo: novoTitulo.trim(),
      valor: Number(novoValor) || 0,
      descricao: novaDescricao.trim() || "Imóvel disponível para visitação e avaliação.",
      status: "disponivel",
      fotos: novasFotos.length ? novasFotos : ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80"],
      caracteristicas: { quartos: 3 },
      proprietarioId: novaProprietarioId || undefined,
    }

    if (modoEdicaoImovel && imovelEditandoId) {
      setImoveis((prev) => prev.map((imovel) => (imovel.id === imovelEditandoId ? payload : imovel)))
    } else {
      setImoveis((prev) => [payload, ...prev])
    }

    limparFormularioImovel()
    setModalImovelAberto(false)
  }

  const handleExcluirImovel = (id: string) => {
    const confirmar = window.confirm("Deseja excluir este imóvel?")
    if (!confirmar) return

    setImoveis((prev) => prev.filter((imovel) => imovel.id !== id))
  }

  const handleCadastrarProprietario = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!novoPropNome.trim()) return

    const novo: Proprietario = {
      id: Date.now().toString(),
      nome: novoPropNome.trim(),
      telefone: novoPropTelefone.trim() || "Não informado",
      email: novoPropEmail.trim() || "Não informado",
      endereco: novoPropEndereco.trim() || "Não informado",
      observacoes: novoPropObservacoes.trim() || "Sem observações.",
    }

    setProprietarios((prev) => [novo, ...prev])
    setNovoPropNome("")
    setNovoPropTelefone("")
    setNovoPropEmail("")
    setNovoPropEndereco("")
    setNovoPropObservacoes("")
    setModalProprietarioAberto(false)
  }

  const handleExcluirProprietario = (id: string) => {
    const confirmar = window.confirm("Deseja excluir este proprietário?")
    if (!confirmar) return

    setProprietarios((prev) => prev.filter((item) => item.id !== id))
    setImoveis((prev) =>
      prev.map((imovel) =>
        imovel.proprietarioId === id ? { ...imovel, proprietarioId: undefined } : imovel,
      ),
    )
  }

  const abrirGaleriaImovel = (imovel: Imovel) => {
    setImovelSelecionado(imovel)
    setModalDetalheImovelAberto(true)
  }

  const handleWhatsappShare = (imovel: Imovel) => {
    const texto = [
      `Olá! Tenho interesse no imóvel: ${imovel.titulo}`,
      `Valor: ${imovel.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
      `Descrição: ${imovel.descricao}`,
      `Proprietário: ${obterNomeProprietario(imovel.proprietarioId)}`,
      `Fotos: ${imovel.fotos.join("\n")}`,
    ].join("\n\n")

    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const fotoAtual = imovelSelecionado?.fotos?.[fotoAtualIndex] ?? ""

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white border-b border-slate-700 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
              <Building2 className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-blue-200">Consultora Imobiliária</p>
              <span className="font-bold text-xl">Vanessa Almeida</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-200 font-medium bg-white/5 rounded-full px-3 py-2 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Conectado ao Supabase
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 border-b border-slate-200 pb-4">
          <button
            onClick={() => setAbaAtiva("imoveis")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              abaAtiva === "imoveis"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Meus Imóveis ({imoveis.length})
          </button>
          <button
            onClick={() => setAbaAtiva("proprietarios")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              abaAtiva === "proprietarios"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <User className="w-4 h-4" />
            Proprietários ({proprietarios.length})
          </button>
          <button
            onClick={() => setAbaAtiva("leads")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
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
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Portfólio de Imóveis</h2>
                <p className="text-sm text-slate-500 mt-1">Selecione, destaque e venda com mais qualidade.</p>
              </div>

              <button
                onClick={abrirFormularioNovoImovel}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Novo Imóvel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {imoveis.map((imovel) => {
                const fotoPrincipal = imovel.fotos?.[0] ?? "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80"
                const fotosSecundarias = Array.isArray(imovel.fotos) ? imovel.fotos.slice(1, 4) : []

                return (
                  <div
                    key={imovel.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => abrirGaleriaImovel(imovel)}
                  >
                    <div className="relative">
                      {imovel.fotos.length > 1 ? (
                        <div className="grid grid-cols-2 gap-1 h-52">
                          <img src={fotoPrincipal} alt={imovel.titulo} className="w-full h-full object-cover col-span-2" />
                          {fotosSecundarias.map((foto, index) => (
                            <div key={`${imovel.id}-${index}`} className="relative h-24 overflow-hidden">
                              <img src={foto} alt={`${imovel.titulo} ${index + 2}`} className="w-full h-full object-cover" />
                              {index === 2 && imovel.fotos.length > 4 && (
                                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center text-white font-semibold text-sm">
                                  +{imovel.fotos.length - 4}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="relative h-52 bg-slate-100">
                          <img src={fotoPrincipal} alt={imovel.titulo} className="w-full h-full object-cover" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleExcluirImovel(imovel.id)
                        }}
                        className="absolute top-3 left-3 flex items-center justify-center rounded-full bg-red-600 text-white p-2 shadow-md hover:bg-red-700 transition-colors"
                        aria-label={`Excluir ${imovel.titulo}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          abrirFormularioEdicaoImovel(imovel)
                        }}
                        className="absolute top-3 left-12 flex items-center justify-center rounded-full bg-blue-600 text-white p-2 shadow-md hover:bg-blue-700 transition-colors"
                        aria-label={`Editar ${imovel.titulo}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {imovel.status}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-xl text-slate-800 mb-2">{imovel.titulo}</h3>
                      <p className="text-sm text-slate-600 mb-2">Proprietário: {obterNomeProprietario(imovel.proprietarioId)}</p>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-3">{imovel.descricao}</p>
                      <p className="text-blue-600 font-extrabold text-2xl mb-4">
                        {imovel.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>

                      <div className="flex flex-wrap gap-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                        <span className="bg-slate-100 rounded-full px-2 py-1">🛏️ {imovel.caracteristicas.quartos || 0} Quartos</span>
                        <span className="bg-slate-100 rounded-full px-2 py-1">
                          🏊 {imovel.caracteristicas.piscina ? "Com Piscina" : "Padrão"}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {abaAtiva === "proprietarios" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Proprietários</h2>
                <p className="text-sm text-slate-500 mt-1">Gerencie os donos dos imóveis.</p>
              </div>

              <button
                onClick={() => setModalProprietarioAberto(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Novo Proprietário
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {proprietarios.map((proprietario) => (
                <div key={proprietario.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{proprietario.nome}</h3>
                      <p className="text-sm text-slate-500">{proprietario.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleExcluirProprietario(proprietario.id)}
                      className="rounded-full bg-red-100 p-2 text-red-600 hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {proprietario.telefone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {proprietario.endereco}
                    </p>
                    <p className="text-slate-500 pt-2">{proprietario.observacoes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {abaAtiva === "leads" && (
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Gestão de Leads e Clientes</h2>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">
                {modoEdicaoImovel ? "Editar Imóvel" : "Cadastrar Novo Imóvel"}
              </h3>
              <button
                type="button"
                aria-label="Fechar modal"
                onClick={() => {
                  limparFormularioImovel()
                  setModalImovelAberto(false)
                }}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCadastrarImovel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Título do Imóvel</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cobertura Vista Mar Trancoso"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Descrição</label>
                <textarea
                  rows={4}
                  placeholder="Descreva o imóvel, localização, destaque e características..."
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Valor (R$)</label>
                <input
                  type="number"
                  placeholder="1500000"
                  value={novoValor}
                  onChange={(e) => setNovoValor(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Proprietário</label>
                <select
                  value={novaProprietarioId}
                  onChange={(e) => setNovaProprietarioId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                >
                  <option value="">Sem proprietário</option>
                  {proprietarios.map((proprietario) => (
                    <option key={proprietario.id} value={proprietario.id}>
                      {proprietario.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fotos do imóvel</label>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label htmlFor="foto-camera" className="border-2 border-dashed border-slate-300 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors bg-slate-50 min-h-[110px]">
                      <Camera className="w-7 h-7 text-blue-500 mb-2" />
                      <span className="text-xs font-medium text-slate-600 text-center">Tirar foto</span>
                    </label>
                    <input
                      id="foto-camera"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      onChange={(e) => handleFotoUpload(e, false)}
                    />
                  </div>

                  <div>
                    <label htmlFor="foto-galeria" className="border-2 border-dashed border-slate-300 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors bg-slate-50 min-h-[110px]">
                      <Camera className="w-7 h-7 text-blue-500 mb-2" />
                      <span className="text-xs font-medium text-slate-600 text-center">Galeria</span>
                    </label>
                    <input
                      id="foto-galeria"
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(e) => handleFotoUpload(e, true)}
                    />
                  </div>
                </div>

                {novasFotos.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {novasFotos.map((foto, index) => (
                      <div key={`${foto}-${index}`} className="relative group">
                        <img src={foto} alt={`Foto ${index + 1}`} className="h-20 w-full object-cover rounded-xl border border-slate-200" />
                        <button
                          type="button"
                          aria-label={`Remover foto ${index + 1}`}
                          onClick={() => removerFotoSelecionada(foto)}
                          className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-md opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    limparFormularioImovel()
                    setModalImovelAberto(false)
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                >
                  {modoEdicaoImovel ? "Salvar Alterações" : "Salvar Imóvel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalProprietarioAberto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">Novo Proprietário</h3>
              <button
                type="button"
                onClick={() => setModalProprietarioAberto(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCadastrarProprietario} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={novoPropNome}
                  onChange={(e) => setNovoPropNome(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Telefone</label>
                  <input
                    type="text"
                    value={novoPropTelefone}
                    onChange={(e) => setNovoPropTelefone(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">E-mail</label>
                  <input
                    type="email"
                    value={novoPropEmail}
                    onChange={(e) => setNovoPropEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Endereço</label>
                <input
                  type="text"
                  value={novoPropEndereco}
                  onChange={(e) => setNovoPropEndereco(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Observações</label>
                <textarea
                  rows={3}
                  value={novoPropObservacoes}
                  onChange={(e) => setNovoPropObservacoes(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalProprietarioAberto(false)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                >
                  Salvar Proprietário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalDetalheImovelAberto && imovelSelecionado && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-slate-800">{imovelSelecionado.titulo}</h3>
              <button
                type="button"
                onClick={() => setModalDetalheImovelAberto(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-6">
              <div>
                <div className="relative">
                  <img
                    src={fotoAtual || imovelSelecionado.fotos[0]}
                    alt={imovelSelecionado.titulo}
                    className="w-full h-[320px] object-cover rounded-2xl border border-slate-200"
                  />

                  {imovelSelecionado.fotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setFotoAtualIndex((prev) => (prev === 0 ? imovelSelecionado.fotos.length - 1 : prev - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-800 shadow-sm hover:bg-white"
                        aria-label="Foto anterior"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setFotoAtualIndex((prev) => (prev + 1) % imovelSelecionado.fotos.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-800 shadow-sm hover:bg-white"
                        aria-label="Próxima foto"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  {imovelSelecionado.fotos.map((foto, index) => (
                    <button
                      type="button"
                      key={`${foto}-${index}`}
                      onClick={() => setFotoAtualIndex(index)}
                      className={`overflow-hidden rounded-xl border ${fotoAtualIndex === index ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200"}`}
                    >
                      <img
                        src={foto}
                        alt={`${imovelSelecionado.titulo} ${index + 1}`}
                        className="h-24 w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Valor</p>
                  <p className="text-3xl font-extrabold text-blue-600">
                    {imovelSelecionado.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Descrição</p>
                  <p className="text-sm text-slate-600 mt-2">{imovelSelecionado.descricao}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm text-slate-600">
                  <p><strong>Proprietário:</strong> {obterNomeProprietario(imovelSelecionado.proprietarioId)}</p>
                  <p><strong>Quartos:</strong> {imovelSelecionado.caracteristicas.quartos || 0}</p>
                  <p><strong>Piscina:</strong> {imovelSelecionado.caracteristicas.piscina ? "Sim" : "Não"}</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleWhatsappShare(imovelSelecionado)}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalDetalheImovelAberto(false)
                      abrirFormularioEdicaoImovel(imovelSelecionado)
                    }}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
