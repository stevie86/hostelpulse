import { NextApiRequest, NextApiResponse } from 'next';
import sendEmail from '../sendEmail';
import * as sgMail from '@sendgrid/mail';

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

// Mock console methods to avoid test output pollution
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});


// Get references to mocked functions
const mockSend = sgMail.send as jest.MockedFunction<typeof sgMail.send>;
const mockSetApiKey = sgMail.setApiKey as jest.MockedFunction<typeof sgMail.setApiKey>;

describe('/api/sendEmail', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;
  let statusMock: jest.Mock;
  let endMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock environment variable
    process.env.SENDGRID_API_KEY = 'test-api-key';

    // Mock request
    mockReq = {
      body: {
        subject: 'Test Subject',
        description: 'Test Description',
        email: 'test@example.com',
        name: 'Test User',
      },
      headers: {
        referer: 'https://example.com',
      },
    };

    // Mock response
    statusMock = jest.fn().mockReturnThis();
    endMock = jest.fn();
    sendMock = jest.fn();

    mockRes = {
      status: statusMock,
      end: endMock,
      send: sendMock,
    };

    // Mock SendGrid send to resolve successfully
    (mockSend as any).mockResolvedValue([{ statusCode: 202 }]);
  });

  it('should send email successfully', async () => {
    await sendEmail(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(mockSend).toHaveBeenCalledWith({
      to: ['contact@bstefanski.com'],
      from: 'contact@bstefanski.com',
      subject: 'Test Subject',
      text: 'Test Description',
      html: expect.stringContaining('Name: Test User'),
    });

    expect(statusMock).toHaveBeenCalledWith(204);
    expect(endMock).toHaveBeenCalled();
  });

  it('should handle email sending failure', async () => {
    const error = new Error('SendGrid error');
    mockSend.mockRejectedValue(error);

    await sendEmail(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(sendMock).toHaveBeenCalledWith({ message: error });
    expect(statusMock).toHaveBeenCalledWith(400);
  });

  it('should handle missing referer header', async () => {
    mockReq.headers = {};

    await sendEmail(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('Sent from: Not specified or hidden'),
      })
    );
  });

  it('should include all required fields in email content', async () => {
    await sendEmail(mockReq as NextApiRequest, mockRes as NextApiResponse);

    const emailContent = mockSend.mock.calls[0][0];

    expect(emailContent).toEqual({
      to: ['contact@bstefanski.com'],
      from: 'contact@bstefanski.com',
      subject: 'Test Subject',
      text: 'Test Description',
      html: expect.stringContaining('Name: Test User') &&
            expect.stringContaining('E-mail: test@example.com') &&
            expect.stringContaining('Test Description') &&
            expect.stringContaining('Sent from: https://example.com'),
    });
  });

  it('should handle empty request body fields', async () => {
    mockReq.body = {
      subject: '',
      description: '',
      email: '',
      name: '',
    };

    await sendEmail(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(mockSend).toHaveBeenCalledWith({
      to: ['contact@bstefanski.com'],
      from: 'contact@bstefanski.com',
      subject: '',
      text: '',
      html: expect.stringContaining('Name: ') &&
            expect.stringContaining('E-mail: ') &&
            expect.stringContaining('Sent from: https://example.com'),
    });
  });
});