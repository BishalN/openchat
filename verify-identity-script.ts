import crypto from 'crypto';

const secret = '7471ff593246647c9945a8900dad3c9666bdad4f4934028861a1bdfcdb0ae0b3';
const user_id = 'demo-user-1';
const user_hash = crypto.createHmac('sha256', secret).update(user_id).digest('hex');
const agent_id = 'd87f6f6c-f490-463d-9db5-4e0ab771d343';

const data = {
    user_id,
    user_hash,
};
const encodedData = encodeURIComponent(JSON.stringify(data));
const iframeSrc = `http://localhost:3000/chatbot-iframe/${agent_id}/?data=${encodedData}`;

console.log(iframeSrc);