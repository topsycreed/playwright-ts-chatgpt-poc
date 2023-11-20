import { request } from "@playwright/test";
import { execSync } from 'child_process';

const apiKey = process.env.CHATGPT_API_KEY!;
const endpoint = 'https://api.openai.com/v1/chat/completions';

//logs
const fs = require('fs');
const messagesFilePath = 'chatGPTLogs.txt';

//execute
const testsFileName = 'chatGPTGeneratedTest.spec.ts';
const command = `npx playwright test ${testsFileName}`;
//executeLogs
const capturedMessages: string[] = [];
const logFilePath = 'execution_log_messages.txt';

const originalConsoleLog = console.log;
console.log = (...args: any[]) => {
  const message = args.map(arg => String(arg)).join(' ');
  capturedMessages.push(message);
  originalConsoleLog(...args);
};

//self-heal execution
const testsFilePath = './tests';
const fixedTestFileName = 'apiChatFixedTest.spec.ts';
//path for generated files
const path = require('path');
const testFullPath = path.join(testsFilePath, testsFileName);

export async function sendSimpleMessage(message: string) {
    const requestBody = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {
                "role": "user",
                "content": message
            }
        ],
        "temperature": 0.7
    }

    const contextRequest = await request.newContext();
    const response = await contextRequest.post(endpoint, {
        data: requestBody,
        headers: {
            "Authorization": "Bearer " + apiKey
        },
        timeout: 60000,
        failOnStatusCode: true
    });

    // console.log("sendSimpleMessage status code: " + response.status() + " " + response.statusText());
    const body = await response.json();
    // console.log(body);
    const answer = body.choices[0].message.content;
    // console.log("Answer: ");
    // console.log(answer);
    await logConversation("user", message);
    await logConversation("assistant", answer);
    return answer;
}

export async function sendSystemMessage(message: string) {
    const systemMessage = "Behave like Automation QA Enginner. Your tech stack: TypeScript, Playwright, axios. Your main goal is to write API tests for baseUrl = process.env.BASE_URL!;. It should be only API calls without any UI steps. If you return code ALWAYS return any additional text as comments!";
    const requestBody = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {
                "role": "system",
                "content": systemMessage
            },
            {
                "role": "user",
                "content": message
            }
        ],
        "temperature": 0.7
    }

    const contextRequest = await request.newContext();
    const response = await contextRequest.post(endpoint, {
        data: requestBody,
        headers: {
            "Authorization": "Bearer " + apiKey
        },
        timeout: 60000,
        failOnStatusCode: true
    });

    // console.log("sendSimpleMessage status code: " + response.status() + " " + response.statusText());
    const body = await response.json();
    // console.log(body);
    const answer = body.choices[0].message.content;
    // console.log("Answer: ");
    // console.log(answer);
    await logConversation("system", systemMessage);
    await logConversation("user", message);
    await logConversation("assistant", answer);
    return answer;
}

export async function sendConversationMessage(messages: { role: string; content: string }[], message: string) {
    messages.push({ role: 'user', content: message });
    await logConversation('user', message);
    const requestBody = {
        "model": "gpt-3.5-turbo",
        "messages": messages,
        "temperature": 0.7
    }
    // console.log("requestBody: ");
    // console.log(requestBody);
    const contextRequest = await request.newContext();
    const response = await contextRequest.post(endpoint, {
        data: requestBody,
        headers: {
            "Authorization": "Bearer " + apiKey
        },
        timeout: 60000,
        failOnStatusCode: true
    });

    // console.log("sendSimpleMessage status code: " + response.status() + " " + response.statusText());
    const body = await response.json();
    // console.log(body);
    const answer = body.choices[0].message.content;
    // console.log("Answer: ");
    // console.log(answer);
    messages.push({ role: 'assistant', content: answer });
    await logConversation("assistant", answer);
    return answer;
}

export async function logConversation(role: string, content: string) {
    const capturedMessages: string[] = [];
    capturedMessages.push("Role: " + role + '\n');
    capturedMessages.push(content + '\n');
    fs.appendFileSync(messagesFilePath, capturedMessages.join(''));
}

export async function executeTest() {
    //clean the execution logs
    capturedMessages.length = 0;
    fs.writeFileSync(logFilePath, "");
    
    try {
      var result = execSync(command).toString();
      console.log("Test passed!" + result);
    } catch (error) {
      console.log("Test failed!" + error.stdout.toString());
    }
    //logging test results to file
    fs.writeFileSync(logFilePath, capturedMessages.join('\n'));
}

export async function getStatus() {
    let status;
    try {
      const fileContent = fs.readFileSync(logFilePath, 'utf-8');
      const lines = fileContent.split('\n');
      status = lines[0];
    } catch (err) {
      throw new Error('Error reading the file to get status:' + err);
    };
    return status;
}

export async function getExecutionLog() {
    let log;
    try {
      const fileContent = fs.readFileSync(logFilePath, 'utf-8');
      const lines = fileContent.split('\n');
      log = fileContent.split('\n').join('');
    } catch (err) {
      throw new Error('Error reading the file to get execution logs:' + err);
    };
    return log;
}

export async function getLatestCode() {
    let latestCode;
    try {
      const testFullPath = require('path').join(testsFilePath, testsFileName);
      const fileContent = fs.readFileSync(testFullPath, 'utf-8');
      latestCode = fileContent.split('\n').join('');
    } catch (err) {
      throw new Error('Error reading the file with test code:' + err);
    };
    return latestCode;
}

export async function createTest(code: string) {
    fs.writeFileSync(testFullPath, code);
}

export async function createTestWithPath(path: string, code: string) {
    const fixedTestFullPath = require('path').join(testsFilePath, path);
    fs.writeFileSync(fixedTestFullPath, code);
}

export async function executeTestByName(testName: string) {
    //clean the execution logs
    capturedMessages.length = 0;
    fs.writeFileSync(logFilePath, "");

    try {
      var result = execSync("npx playwright test " + testName).toString();
      console.log("Test passed!" + result);
    } catch (error) {
      console.log("Test failed!" + error.stdout.toString());
    }
    //logging test results to file
    fs.writeFileSync(logFilePath, capturedMessages.join('\n'));
}

export async function executeTestWithSelfHeal(messages: { role: string; content: string }[]) {
    //try to executes scenario several times before self-healing
    let maxAttempts = 3;
    let passed = false;
    for (let i = 0; i < maxAttempts; i++) {
      await executeTest();
      let status = await getStatus();
      if ('Test passed!' == status) {
        passed = true;
        break;
      }
    }
    if (passed) {
      console.log("Test passed at least once in " + maxAttempts + " attempts. So no auto-fix required. Please check your env or scenario.");
    } else {
      //Need to ask chatGPT to fix the test
      let executionFullLog = await getExecutionLog();
      let chatGPTErrorPromt = "I executed test that you generated for me. It failed, please write suggestions to fix it. This is the results of my executions: " + executionFullLog;
      let latestCode = await getLatestCode();
      await sendConversationMessage(messages, chatGPTErrorPromt);
      const newTestCode = await sendConversationMessage(messages, "Thanks! Now fix the latest test code with those suggestions and return fixed version! This is the latest code version: " + latestCode);
      await createTestWithPath(fixedTestFileName, newTestCode);
      await executeTestByName(fixedTestFileName);
      let status = await getStatus();
      if ('Test passed!' == status) {
        console.log('Fix helped!');
      } else {
        console.log('Even after the fix there are still error!');
      }
    }
}