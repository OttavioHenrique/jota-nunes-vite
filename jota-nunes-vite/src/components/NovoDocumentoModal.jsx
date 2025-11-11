import { useNavigate } from "react-router-dom";
import { Plus, FileText } from "lucide-react";

export default function NovoDocumentoModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* fundo */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* conteúdo */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col gap-6 z-10 animate-slide-in">
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Novo Projeto
        </h2>

        <button
          onClick={() => {
            onClose();
            navigate("/criacao");
          }}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-5 py-3 rounded-2xl font-semibold shadow-md transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          Criar do Zero
        </button>

        <button
          onClick={() => {
            onClose();
            navigate("/modeloPadrao");
          }}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-5 py-3 rounded-2xl font-semibold shadow-md transition-all duration-300"
        >
          <FileText className="w-5 h-5" />
          Usar Modelo Padrão
        </button>

        <button
          onClick={onClose}
          className="text-gray-500 text-sm hover:text-gray-700 hover:underline self-center mt-2"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
