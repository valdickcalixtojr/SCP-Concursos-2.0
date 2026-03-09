import { useRef, ChangeEvent } from 'react';
import Papa from 'papaparse';
import { Upload } from 'lucide-react';
import { useConcursoStore, Concurso } from '../store';

export function CSVUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setConcursos, concursos: existingConcursos } = useConcursoStore();

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ';', // Set delimiter to semicolon
      complete: (results) => {
        const parsedData = results.data as any[];
        const seenIds = new Set<string>();
        const newConcursos: Concurso[] = [];

        parsedData.forEach((row, index) => {
          // Map CSV headers to our Concurso interface
          const baseId = `${row.Orgao}-${row.Link || index}`;
          let id = baseId;
          let counter = 1;
          while (seenIds.has(id)) {
            id = `${baseId}-${counter}`;
            counter++;
          }
          seenIds.add(id);
          
          // Check if we already have this concurso to preserve interest_status and notes
          const existing = existingConcursos.find(c => c.id === id);

          newConcursos.push({
            id,
            // Source fields (both for compatibility)
            source: row.Fonte || row.fonte || 'N/A',
            fonte: row.Fonte || row.fonte || 'N/A',
            // Institution fields
            institution: row.Orgao || row.orgao || 'N/A',
            orgao: row.Orgao || row.orgao || 'N/A',
            // Location fields
            location: row.UF || row.uf || 'N/A',
            uf: row.UF || row.uf || 'N/A',
            // Board fields
            board: row.Banca || row.banca || 'A Definir',
            banca: row.Banca || row.banca || 'A Definir',
            // Vacancies fields
            vacancies: row.Vagas || row.vagas || 'N/A',
            vagas: row.Vagas || row.vagas || 'N/A',
            // Salary fields
            salary: row.Salario || row.salario || 'N/A',
            salario: row.Salario || row.salario || 'N/A',
            // Registration end fields
            registration_end: row.Fim_Inscricoes || row.fim_inscricoes || 'N/A',
            fim_inscricoes: row.Fim_Inscricoes || row.fim_inscricoes || 'N/A',
            // Exemption period fields
            exemption_period: row.Periodo_Isencao || row.periodo_isencao || 'N/A',
            periodo_isencao: row.Periodo_Isencao || row.periodo_isencao || 'N/A',
            // Exam date fields
            exam_date: row.Data_Prova || row.data_prova || 'A Definir',
            data_prova: row.Data_Prova || row.data_prova || 'A Definir',
            link: row.Link || row.link || '',
            // Positions fields
            positions: row.Cargos || row.cargos || 'N/A',
            cargos: row.Cargos || row.cargos || 'N/A',
            // Subjects fields
            subjects: row.Disciplinas || row.disciplinas || 'N/A',
            disciplinas: row.Disciplinas || row.disciplinas || 'N/A',
            // Other fields
            esfera: row.Esfera || row.esfera || 'N/A',
            modalidade: row.Modalidade || row.modalidade || 'N/A',
            status: row.Status || row.status || 'N/A',
            escolaridade: row.Escolaridade || row.escolaridade || 'N/A',
            etapas: row.Etapas || row.etapas || 'N/A',
            duplicadas: row.Duplicadas || row.duplicadas || 'N/A',
            // User state
            interest_status: existing?.interest_status || 'none',
            is_favorite: existing?.is_favorite || false,
            is_enrolled: existing?.is_enrolled || false,
            exam_location: existing?.exam_location,
            notes: existing?.notes,
            latitude: existing?.latitude,
            longitude: existing?.longitude,
          });
        });

        setConcursos(newConcursos);
        alert(`${newConcursos.length} concursos carregados com sucesso!`);
      },
      error: (error) => {
        console.error('Erro ao processar CSV:', error);
        alert('Erro ao processar o arquivo CSV.');
      }
    });
  };

  return (
    <div className="flex items-center">
      <input
        type="file"
        accept=".csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl hover:bg-slate-700 transition-colors shadow-sm text-sm font-medium"
      >
        <Upload size={18} />
        <span>Upload CSV</span>
      </button>
    </div>
  );
};
