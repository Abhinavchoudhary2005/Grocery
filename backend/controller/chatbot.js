const getAIResponse = async (prompt) => {
  try {
    console.log(`Prompt sent to Gemini: ${prompt}`);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY2}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Gemini API Error:", errorData);
      return `Error: ${errorData.message || "Unknown error"}`;
    }

    const data = await response.json();
    const aiResponse =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    return aiResponse;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return `Error: ${error.message}`;
  }
};

const chatbot = async (req, res) => {
  const userMessage = req.body.message?.trim().toLowerCase();
  const previousBotMessage = req.body.previousBotMessage || "";
  const allProductNames = req.body.allProductNames || [];

  if (!userMessage) {
    return res.json({ reply: "Please enter a valid message." });
  }

  // ✅ Format available products as a readable list
  const productList = allProductNames
    .map((p) => `${p.name} (${p.quantity}) - ₹${p.price}`)
    .join(", ");

  // ✅ Updated prompt with better context and list logic
  const prompt = `
        Previous bot response: ${previousBotMessage || "None"}
    
        - Previous response is just for context. Ignore if empty.
        - If the user says "add these to cart," return the list they provided.
        - Available products: ${productList || "No products available"}.
        - If listing products, only mention available products.
        -if user ask for recipe ingrident provide it remeber you dont have constraint to provide information only on the products you see above.
    
        - If user says anaylze the cart 
                Analyze the user's cart and provide a category breakdown:

                - Group items by category.  
                - Show the **total cost** and **percentage of total cost** for each category.  
                - Include the **number of items** in each category.  
                - Highlight the **most expensive category** and the **least expensive category**.  
                - Respond concisely in markdown format using bullet points.  
                - If any category has only one item, mention it.  
                - If categories are unbalanced (e.g., too much dairy or few vegetables), suggest a balanced approach.  
        -  if user says anaylze the cart dont end with **"Do you want to add these items to your cart?"**
    
        Respond concisely in markdown format:
        - Use **bullet points** for lists.
        - If providing a list, end with **"Do you want to add these items to your cart?"** and make it bold
        - If confirming cart addition, avoid asking again.
        **User query:** ${userMessage}
      `;

  try {
    const aiResponse = await getAIResponse(prompt);

    return res.json({ reply: aiResponse });
  } catch (error) {
    console.error("❌ Error generating response:", error);
    return res.status(500).json({ error: "Failed to generate response" });
  }
};

module.exports = { chatbot };
