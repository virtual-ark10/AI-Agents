import OpenAI from "openai";
import dotenv from "dotenv"
dotenv.config();

//Instantiate OpenAI with required Configs
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
})

const competitors = [];
const answers = [];

let together = "";



//Create an instance of OpenAI client using OpenRouter with required configs
const llamaLocal = async (prompt) => {

    const openai = new OpenAI({
    apiKey: 'ollama',
    baseURL: "http://localhost:11434/v1",
    })

    const response = await openai.chat.completions.create({
        model: "llama3.2",
        messages: [{
            role: "user",
            content: prompt
        }]
    })

    const finalResponse = response.choices[0].message.content

    console.log("Local Llama Response: \n" + finalResponse)

    const answer = JSON.stringify(finalResponse)

    competitors.push(response.model)
    answers.push(answer)

    return answer;
}

const firstResponse = async (prompt) => {

    const response = await openai.chat.completions.create({
        model: "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
        messages: [{
            role: "user",
            content: prompt
        }]
    })

    const finalResponse = response.choices[0].message.content

    console.log("NVIDIA Response \n" + finalResponse)

    const answer = JSON.stringify(finalResponse)

    competitors.push(response.model)
    answers.push(answer)

    return answer;
}

const deepseekResponse = async (prompt) => {

    const response = await openai.chat.completions.create({
        model: "deepseek/deepseek-r1-0528:free",
        messages: [{
            role: "user",
            content: prompt
        }]
    })

    const finalResponse = response.choices[0].message.content


    const finalAnswer = JSON.stringify(finalResponse)

    competitors.push(response.model)
    answers.push(finalAnswer)

    console.log("DEEPSEEK RESPONSE: \n" + finalAnswer)


    return finalAnswer;


}

const openaiResponse = async (prompt) => {

    const response = await openai.chat.completions.create({
        model: "openai/gpt-4.1-mini",
        //model: "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
        messages: [{
            role: "user",
            content: prompt
        }]
    })

    const finalResponse = response.choices[0].message.content

    const finalAnswer = JSON.stringify(finalResponse)

    competitors.push(response.model)
    answers.push(finalAnswer)

    console.log("OPENAI RESPONSE: " + finalAnswer)


    return finalAnswer;
}

const claudeResponse = async (prompt) => {

    const response = await openai.chat.completions.create({
        model: "anthropic/claude-3.7-sonnet",
        //model: "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
        messages: [{
            role: "user",
            content: prompt
        }]
    })

    const finalResponse = response.choices[0].message.content

    const finalAnswer = JSON.stringify(finalResponse)

    competitors.push(response.model)
    answers.push(finalAnswer)

    console.log("CLAUDE RESPONSE: " + finalAnswer)


    return finalAnswer;
}


const geminiResponse = async(prompt) => {

    const response = await openai.chat.completions.create({
        model: "google/gemini-2.5-pro-preview-05-06",
        //model: "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
        messages: [{
            role: "user",
            content: prompt
        }]
    })

    const finalResponse = response.choices[0].message.content

    const finalAnswer = JSON.stringify(finalResponse)

    competitors.push(response.model)
    answers.push(finalAnswer)

    console.log("GEMINI RESPONSE: " + finalAnswer)


    return finalAnswer;
}

const judgeResponse = (q, comp, both) => {
    const judge = `You are judging a competition between ${comp.length} competitors.  
    Each model has been given this question:

    ${q}

    Your job is to evaluate each response for clarity and strength of argument, and rank them in order of best to worst.  
    Respond with JSON, and only JSON, with the following format:  
    {"results": ["best competitor number", "second best competitor number", "third best competitor number", ...]}

    Here are the responses from each competitor:

    ${both}

    Now respond with the JSON with the ranked order of the competitors, nothing else. Do not include markdown formatting or code blocks.`;

    return judge;

}



async function run() {

    //const question = "Act as a performance marketing expert. I'm preparing a digital launch for a new mindfulness mobile app targeting Gen Z users. Using the RACE framework (Reach, Act, Convert, Engage), outline a campaign strategy. For each stage, include: One creative marketing idea tailored to Gen Z behavior A recommended platform or tool (e.g., TikTok, email, push notifications) A performance metric to evaluate success Also, suggest one way to make the user journey feel more personalized or emotionally resonant."
    
    //const question = "How would you reconcile the paradox of a hypothetical super intelligent AI system, designed to prioritize human flourishing above all else, that determines through rigorous analysis that the most effective means of ensuring long-term human prosperity involves temporarily suppressing certain individual freedoms, and how would you evaluate the ethical implications of such a decision from the perspective of both utilitarian and deontological moral frameworks?"

    const question = "which one came first: chicken or egg?"

    const llamafinalResponse = await llamaLocal(question)
    
    const firstNvidiaResponse = await firstResponse(question)

    const deepFinalResponse = await deepseekResponse(question)

    const openaiFinalResponse = await openaiResponse(question)

    const claudeFinalResponse = await claudeResponse(question)

    const geminiFinalResponse = await geminiResponse(question)

    console.log("Nvidia Response \n" + firstNvidiaResponse + "DeepSeek Response: \n" + deepFinalResponse + "Claude Final Response: \n" + claudeFinalResponse + "Gemini Final Response: \n" + geminiFinalResponse + "OpenAI Response: \n" + openaiFinalResponse + "Llama Response: \n" + llamafinalResponse)

    console.log(competitors)

    console.log(answers)

    const mappedResponses = mapResponses(competitors, answers)

    answers.forEach((answer, index) => {
        together += `# Response from competitor ${index + 1}\n\n`
        together += answer + "\n\n"
    })
    

    console.log(mappedResponses);
    console.log(together)

    const finalJudgePrompt = judgeResponse(question, competitors, together);

    // Use a powerful model to act as the judge
    const judgeOutput = await openai.chat.completions.create({
        model: "openai/gpt-4.1-mini", // You can use any high-accuracy model
        messages: [{
            role: "user",
            content: finalJudgePrompt
        }]
    });

    const judgeAnswer = judgeOutput.choices[0].message.content;

    console.log("\n🏁 Final Judgement:\n", judgeAnswer);

    // return judgeAnswer;

    mapJudgeLLM(judgeAnswer)
    
}

run()


function mapResponses(arr1, arr2) {
    return arr1.map((item, index) => [item, arr2[index]])
}

function mapJudgeLLM(judgeAnswer) {
    const resultsObject = JSON.parse(judgeAnswer)
    const ranks = resultsObject["results"]

    ranks.forEach((result, index) => {
        const competitor = competitors[parseInt(result) - 1];
        console.log(`Rank ${index + 1}: ${competitor}`)
    })

}











