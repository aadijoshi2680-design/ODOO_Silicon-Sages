// ============================================================
// OCRService — Gemini Vision API for receipt scanning (IMPROVED)
// Better prompt, retry logic, forced JSON, MIME handling
// ============================================================

const OCRService = (() => {
  const GEMINI_API_KEY = 'AIzaSyBWFCeaQ0T612muVhTbfl68ORj8NkcCw1A';

  /**
   * Scan a receipt image using Gemini Vision API
   * @param {string} imageBase64 - data:image/...;base64,... string
   * @returns {{ success: boolean, data?: object, error?: string }}
   */
  async function scanReceipt(imageBase64) {
    // Retry up to 2 times
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        // Extract the base64 part and mime type — handle all image formats
        const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        if (!match) {
          // Fallback: try treating as generic image
          const fallbackMatch = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
          if (!fallbackMatch) {
            return { success: false, error: 'Invalid image format. Please upload a JPG, PNG, or WebP image.' };
          }
          var mimeType = fallbackMatch[1];
          var base64Data = fallbackMatch[2];
        } else {
          var mimeType = match[1];
          var base64Data = match[2];
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  {
                    text: `You are an expert receipt/invoice data extractor. Look at this image very carefully.

TASK: Extract financial data from this receipt/invoice/bill image.

RULES:
1. Read EVERY visible text on the receipt carefully
2. Find the TOTAL/GRAND TOTAL/AMOUNT DUE — this is the final amount to pay (NOT subtotal)
3. Identify the currency from symbols (₹=INR, $=USD, €=EUR, £=GBP) or context
4. Find the date in the receipt
5. Identify the merchant/store/restaurant name
6. Categorize as: Travel, Food, Accommodation, Office Supplies, Entertainment, or Other
7. List all visible line items

Return ONLY this JSON object, nothing else:
{"merchant":"store name","total":123.45,"currency":"INR","date":"2025-01-15","category":"Food","items":["item1","item2"],"reasoning":"why I chose these values"}

IMPORTANT:
- "total" must be a NUMBER (no currency symbols, no commas for thousands)
- "date" must be YYYY-MM-DD format
- If you cannot read a field, make your best guess from context
- Do NOT wrap in markdown code blocks
- Return ONLY the JSON object`
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
          if (attempt === 0) continue; // retry
          return { success: false, error: `API error: ${response.status}` };
        }

        const result = await response.json();
        let textContent = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Clean up response — remove markdown code blocks if present
        textContent = textContent
          .replace(/```json\s*/gi, '')
          .replace(/```\s*/g, '')
          .trim();

        // Try to extract JSON from anywhere in the response
        if (!textContent.startsWith('{')) {
          const jsonStart = textContent.indexOf('{');
          const jsonEnd = textContent.lastIndexOf('}');
          if (jsonStart !== -1 && jsonEnd !== -1) {
            textContent = textContent.substring(jsonStart, jsonEnd + 1);
          }
        }

        const parsed = JSON.parse(textContent);

        // Validate & clean parsed data
        const cleaned = {
          merchant: String(parsed.merchant || parsed.store || parsed.vendor || 'Unknown Vendor'),
          total: parseFloat(String(parsed.total || parsed.amount || parsed.grand_total || 0).replace(/[^0-9.]/g, '')) || 0,
          currency: String(parsed.currency || 'INR').toUpperCase().substring(0, 3),
          date: parsed.date || new Date().toISOString().split('T')[0],
          category: parsed.category || 'Other',
          items: Array.isArray(parsed.items) ? parsed.items : [],
          reasoning: parsed.reasoning || '',
        };

        // Validate category
        const validCategories = ['Travel', 'Food', 'Accommodation', 'Office Supplies', 'Entertainment', 'Other'];
        if (!validCategories.includes(cleaned.category)) {
          cleaned.category = 'Other';
        }

        return { success: true, data: cleaned };
      } catch (err) {
        console.warn(`OCR scan error (attempt ${attempt + 1}):`, err);
        if (attempt === 0) continue; // retry
        return { success: false, error: err.message };
      }
    }
    return { success: false, error: 'Max retries exceeded' };
  }

  /**
   * Mock scan for demo purposes
   */
  function mockScan() {
    const mocks = [
      { merchant: 'Blue Ginger Restaurant', total: 2450, currency: 'INR', date: '2025-10-15', category: 'Food', items: ['Butter Chicken x1', 'Naan x4', 'Lassi x2'], reasoning: 'Restaurant receipt with Indian cuisine items.' },
      { merchant: 'Uber Technologies', total: 650, currency: 'INR', date: '2025-10-14', category: 'Travel', items: ['Airport Transfer'], reasoning: 'Cab ride receipt from Uber.' },
      { merchant: 'Marriott International', total: 120, currency: 'USD', date: '2025-10-13', category: 'Accommodation', items: ['1 Night Suite', 'WiFi'], reasoning: 'Hotel invoice with USD pricing.' },
      { merchant: 'Staples Office Supplies', total: 45, currency: 'USD', date: '2025-10-08', category: 'Office Supplies', items: ['Printer Cartridge x2', 'A4 Paper'], reasoning: 'Office supply store receipt.' },
    ];
    return mocks[Math.floor(Math.random() * mocks.length)];
  }

  return { scanReceipt, mockScan };
})();
