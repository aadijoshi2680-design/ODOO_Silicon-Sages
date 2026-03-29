// ============================================================
// OCRService — Gemini Vision API for Receipt Scanning
// Uses the same extraction rules as the Lyzr ORC SCANNER agent
// ============================================================

const OCRService = (() => {
  const GEMINI_API_KEY = 'AIzaSyBWFCeaQ0T612muVhTbfl68ORj8NkcCw1A';

  async function scanReceipt(imageBase64) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        // Extract base64 and mime
        const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) return { success: false, error: 'Invalid image format. Upload JPG, PNG, or WebP.' };
        const mimeType = match[1];
        const base64Data = match[2];

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  {
                    text: `You are an OCR-based expense data extraction agent.

Your task is to analyze this image of a receipt, invoice, or bill and extract structured financial information.

Extract ONLY the following fields:
- amount: final payable amount (labeled as "Total", "Grand Total", "Amount Paid"). Return as a number (no symbols).
- currency: ISO currency code detected from symbol (₹→INR, $→USD, €→EUR, £→GBP) or text context.
- date: transaction date in YYYY-MM-DD format. If multiple dates exist, choose the most relevant.
- vendor: merchant or business name (typically at the top of the receipt).
- category: classify as one of: Food, Travel, Accommodation, Office Supplies, Entertainment, Other.
- items: array of line items visible on the receipt.
- reasoning: 1-sentence explanation of your extraction.

Classification rules:
- Food: restaurants, cafes, food delivery, groceries
- Travel: transport, fuel, flights, cabs, tolls
- Accommodation: hotels, stays, lodging
- Office Supplies: software, hardware, stationery, office equipment
- Entertainment: movies, events, subscriptions
- Other: anything that doesn't fit above

IMPORTANT RULES:
- Return ONLY valid JSON, no extra text
- "amount" must be a NUMBER (no currency symbols, no commas)
- "date" must be YYYY-MM-DD format
- If a field cannot be determined, return null
- Do NOT hallucinate or guess missing values
- Do NOT wrap in markdown code blocks

Output format:
{"amount":0.00,"currency":"INR","date":"YYYY-MM-DD","vendor":"string","category":"string","items":["item1","item2"],"reasoning":"string"}`
                  },
                  {
                    inlineData: { mimeType, data: base64Data }
                  }
                ]
              }],
              generationConfig: {
                temperature: 0.05,
                maxOutputTokens: 2048,
                responseMimeType: 'application/json',
              }
            })
          }
        );

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`Gemini API error (attempt ${attempt + 1}):`, errText);
          if (attempt === 0) continue;
          return { success: false, error: `API error: ${response.status}` };
        }

        const result = await response.json();
        let textContent = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Clean markdown wrappers
        textContent = textContent.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        if (!textContent.startsWith('{')) {
          const s = textContent.indexOf('{'), e = textContent.lastIndexOf('}');
          if (s !== -1 && e !== -1) textContent = textContent.substring(s, e + 1);
        }

        const parsed = JSON.parse(textContent);

        // Map to internal format
        const cleaned = {
          merchant: String(parsed.vendor || parsed.merchant || parsed.store || 'Unknown Vendor'),
          total: parseFloat(String(parsed.amount || parsed.total || 0).replace(/[^0-9.]/g, '')) || 0,
          currency: String(parsed.currency || 'INR').toUpperCase().substring(0, 3),
          date: parsed.date || new Date().toISOString().split('T')[0],
          category: validateCategory(parsed.category),
          items: Array.isArray(parsed.items) ? parsed.items : [],
          reasoning: parsed.reasoning || 'Extracted via Gemini Vision OCR',
        };

        return { success: true, data: cleaned };
      } catch (err) {
        console.warn(`OCR error (attempt ${attempt + 1}):`, err);
        if (attempt === 0) continue;
        return { success: false, error: err.message };
      }
    }
    return { success: false, error: 'Max retries exceeded' };
  }

  function validateCategory(cat) {
    if (!cat) return 'Other';
    const valid = ['Travel', 'Food', 'Accommodation', 'Office Supplies', 'Entertainment', 'Other'];
    const lower = cat.toLowerCase();
    for (const v of valid) { if (lower.includes(v.toLowerCase())) return v; }
    if (lower.includes('restaurant') || lower.includes('cafe') || lower.includes('grocery')) return 'Food';
    if (lower.includes('hotel') || lower.includes('stay')) return 'Accommodation';
    if (lower.includes('cab') || lower.includes('uber') || lower.includes('flight') || lower.includes('fuel')) return 'Travel';
    if (lower.includes('office') || lower.includes('stationery') || lower.includes('software')) return 'Office Supplies';
    return 'Other';
  }

  function mockScan() {
    const mocks = [
      { merchant: 'Blue Ginger Restaurant', total: 2450, currency: 'INR', date: '2025-10-15', category: 'Food', items: ['Butter Chicken x1', 'Naan x4', 'Lassi x2'], reasoning: 'Restaurant receipt with Indian cuisine items.' },
      { merchant: 'Uber Technologies', total: 650, currency: 'INR', date: '2025-10-14', category: 'Travel', items: ['Airport Transfer'], reasoning: 'Cab ride receipt from Uber.' },
      { merchant: 'Marriott International', total: 120, currency: 'USD', date: '2025-10-13', category: 'Accommodation', items: ['1 Night Suite', 'WiFi'], reasoning: 'Hotel invoice with USD pricing.' },
    ];
    return mocks[Math.floor(Math.random() * mocks.length)];
  }

  return { scanReceipt, mockScan };
})();
