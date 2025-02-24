import { NextResponse } from 'next/server';
import { POST as generateHandler } from '../src/app/api/generate/route';

// 1) Mock the entire openai library
jest.mock('openai', () => {
  const mockCreateChatCompletion = jest.fn();

  // Return object that mimics structure of 'openai'
  return {
    // Mocked Config constructor
    Configuration: jest.fn().mockImplementation(() => ({})),

    // Mock OAI client
    OpenAIApi: jest.fn().mockImplementation(() => {
      return {
        createChatCompletion: mockCreateChatCompletion,
      };
    }),

    // For convenience, export mock so we can reference it in our tests
    __mockCreateChatCompletion: mockCreateChatCompletion,
  };
});

// 2) Extract the mock function so we can manipulate or inspect it
const { __mockCreateChatCompletion } = jest.requireMock('openai');

describe('POST /api/generate (Advanced Tests)', () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  it('should call OpenAI with correct prompt and return the content', async () => {
    // Set up mock result from OpenAI
    __mockCreateChatCompletion.mockResolvedValueOnce({
      data: {
        choices: [
          {
            message: {
              content: 'Mocked AI blog output'
            }
          }
        ]
      }
    });

    // Prepare request with topic + title
    const request = new Request('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        topic: 'Test Topic',
        title: 'My Great Title'
      })
    });

    // Call route
    const response = await generateHandler(request);
    const json = await response.json();

    // Basic checks
    expect(response).toBeInstanceOf(NextResponse);
    expect(json.content).toBe('Mocked AI blog output');

    // 3) Verify the route calls OpenAIApi with certain arguments
    expect(__mockCreateChatCompletion).toHaveBeenCalledTimes(1);
    expect(__mockCreateChatCompletion).toHaveBeenCalledWith({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: expect.stringContaining('Write a comprehensive blog post')
        }
      ],
      temperature: 0.7,
    });
  });


  it('returns 500 if OpenAI throws an error', async () => {
    // Force an error in the mock
    __mockCreateChatCompletion.mockRejectedValueOnce(new Error('OpenAI failure'));

    const request = new Request('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        topic: 'Bad topic',
        title: ''
      })
    });

    const response = await generateHandler(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Failed to generate content');
  });


  it('returns 500 if request body is invalid (missing JSON)', async () => {
    // No body at all
    const request = new Request('http://localhost:3000/api/generate', {
      method: 'POST',
    });

    // The route's code might throw on request.json() or guard it
    // You may wrap your route with try/catch or check if body is empty first
    const response = await generateHandler(request);
    const json = await response.json();

    // Depending on your route code logic, you might handle it differently,
    // but let's assume it fails
    expect(response.status).toBe(500);
    expect(json.error).toMatch(/Failed to generate content/i);
  });


  it('snapshot test for stable AI output', async () => {
    __mockCreateChatCompletion.mockResolvedValueOnce({
      data: {
        choices: [
          {
            message: {
              content: `
Mocked AI blog output with Markdown
# Title
- bullet A
- bullet B
`
            }
          }
        ]
      }
    });

    const request = new Request('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        topic: 'Snapshot Topic'
      })
    });

    const response = await generateHandler(request);
    const { content } = await response.json();

    // Store a snapshot of the content. If it changes unexpectedly,
    // Jest will report a mismatch
    expect(content).toMatchSnapshot();
  });
});

// import { NextResponse } from 'next/server';
// import { POST as generateHandler } from '../src/app/api/generate/route';

// // Mock the openai library so we don't make real calls:
// jest.mock('openai', () => {
//   return {
//     Configuration: jest.fn().mockImplementation(() => ({})),
//     OpenAIApi: jest.fn().mockImplementation(() => {
//       return {
//         createChatCompletion: jest.fn().mockResolvedValue({
//           data: {
//             choices: [
//               { 
//                 message: { 
//                   content: 'Mocked AI blog content' 
//                 } 
//               }
//             ]
//           }
//         })
//       };
//     })
//   };
// });

// describe('POST /api/generate', () => {
//   it('returns generated blog content from OpenAI', async () => {
//     // A mock Next.js Request object:
//     const request = new Request('http://localhost:3000/api/generate', {
//       method: 'POST',
//       body: JSON.stringify({
//         topic: 'Test Topic',
//         title: 'My Great Title'
//       })
//     });

//     const response = await generateHandler(request);
//     const json = await response.json();

//     // Validate the result
//     expect(response).toBeInstanceOf(NextResponse);
//     expect(json.content).toBe('Mocked AI blog content');
//   });
// });