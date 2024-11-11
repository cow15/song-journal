import { handleSMSResponse } from '../../services/smsWorkflowService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { From, Body } = req.body;
  
  try {
    await handleSMSResponse(From, Body);
    res.status(200).end();
  } catch (error) {
    console.error('SMS webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 