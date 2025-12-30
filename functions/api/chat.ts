interface Env {
  AI: Ai;
}

interface RequestBody {
  type: 'annual' | 'final';
  data: {
    year?: number;
    revenue?: number;
    netIncome?: number;
    breakEvenUnits?: number;
    roa?: number;
    roe?: number;
    leverage?: number;
    liquidityRatio?: number;
    summary?: string;
  };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await context.request.json() as RequestBody;
    let prompt: string;

    if (body.type === 'annual') {
      const d = body.data;
      prompt = `Como experto en finanzas corporativas, analiza los resultados del año ${d.year} de una empresa simulada por un estudiante:
- Ingresos: ${d.revenue}€
- Beneficio Neto: ${d.netIncome}€
- Punto Muerto (unidades): ${d.breakEvenUnits?.toFixed(2)}
- ROA: ${((d.roa || 0) * 100).toFixed(2)}%
- ROE: ${((d.roe || 0) * 100).toFixed(2)}%
- Apalancamiento: ${d.leverage?.toFixed(2)}
- Liquidez: ${d.liquidityRatio?.toFixed(2)}

Genera un feedback pedagógico corto (máximo 3 párrafos) en español para el estudiante explicando por qué ha tenido estos resultados y qué debería mejorar.`;
    } else {
      prompt = `Actúa como un profesor de Finanzas. Realiza un informe final ejecutivo sobre la trayectoria de la empresa del alumno.
Trayectoria: ${body.data.summary}
Calcula si la gestión ha sido exitosa basándote en la evolución de la rentabilidad y la solvencia. 
Escribe un resumen pedagógico final con conclusiones sobre su aprendizaje.`;
    }

    const response = await context.env.AI.run('@cf/qwen/qwen1.5-14b-chat-awq', {
      messages: [
        { role: 'system', content: 'Eres un experto profesor de finanzas corporativas que da feedback educativo a estudiantes universitarios.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1024,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        feedback: response.response 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error('AI Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        feedback: 'Error al conectar con la IA de análisis financiero.' 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
