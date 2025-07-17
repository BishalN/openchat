import crypto from 'crypto';

const secret = 'b9c375ab2504a5def322a3cbd9a17369fe90fc489bf88c913391ef26811128bc';
const user_id = '1234567890';
const user_hash = crypto.createHmac('sha256', secret).update(user_id).digest('hex');
const agent_id = '9a077eeb-49fe-4a2e-99be-65d0b8f70af9';

const data = {
    user_id,
    user_hash,
    user_metadata: {
        name: "John Doe",
        email: "john@example.com",
        company: "Acme Inc"
    }
};
const encodedData = encodeURIComponent(JSON.stringify(data));
const iframeSrc = `http://localhost:3000/chatbot-iframe/${agent_id}/?data=${encodedData}`;

console.log(iframeSrc);