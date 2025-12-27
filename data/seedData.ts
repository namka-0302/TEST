
import { Question } from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const SEED_QUESTIONS: Question[] = [
  {
    id: generateId(),
    text: "RAM là viết tắt của cụm từ nào?",
    difficulty: "Easy",
    choices: [
      { id: generateId(), label: "A", text: "Random Access Memory", isCorrect: true },
      { id: generateId(), label: "B", text: "Read and Modify", isCorrect: false },
      { id: generateId(), label: "C", text: "Read Access Memory", isCorrect: false },
      { id: generateId(), label: "D", text: "Recent Access Memory", isCorrect: false }
    ],
    explanation: "RAM (Random Access Memory) là bộ nhớ truy cập ngẫu nhiên.",
    createdAt: Date.now(),
    seenCount: 0
  },
  {
    id: generateId(),
    text: "Trong máy tính, RAM có nghĩa là gì?",
    difficulty: "Easy",
    choices: [
      { id: generateId(), label: "A", text: "Là bộ nhớ truy xuất ngẫu nhiên", isCorrect: true },
      { id: generateId(), label: "B", text: "Là bộ nhớ chỉ đọc", isCorrect: false },
      { id: generateId(), label: "C", text: "Là bộ nhớ chỉ xử lý thông tin", isCorrect: false },
      { id: generateId(), label: "D", text: "Là bộ nhớ chỉ ghi", isCorrect: false }
    ],
    createdAt: Date.now(),
    seenCount: 0
  },
  {
    id: generateId(),
    text: "Dữ liệu trong thiết bị nhớ nào sẽ mất khi mất điện?",
    difficulty: "Medium",
    choices: [
      { id: generateId(), label: "A", text: "Đĩa cứng", isCorrect: false },
      { id: generateId(), label: "B", text: "Đĩa mềm", isCorrect: false },
      { id: generateId(), label: "C", text: "RAM", isCorrect: true },
      { id: generateId(), label: "D", text: "ROM", isCorrect: false }
    ],
    explanation: "RAM là bộ nhớ khả biến (volatile), dữ liệu sẽ bị xóa sạch khi nguồn điện bị ngắt.",
    createdAt: Date.now(),
    seenCount: 0
  },
  {
    id: generateId(),
    text: "Khi kết nối thành một mạng máy tính cục bộ, thiết bị nào sau đây có thể được chia sẻ để sử dụng chung?",
    difficulty: "Easy",
    choices: [
      { id: generateId(), label: "A", text: "Máy in", isCorrect: true },
      { id: generateId(), label: "B", text: "Micro", isCorrect: false },
      { id: generateId(), label: "C", text: "Webcam", isCorrect: false },
      { id: generateId(), label: "D", text: "Đĩa mềm", isCorrect: false }
    ],
    createdAt: Date.now(),
    seenCount: 0
  },
  {
    id: generateId(),
    text: "Số các số nhị phân có được từ 1 byte là bao nhiêu?",
    difficulty: "Hard",
    choices: [
      { id: generateId(), label: "A", text: "128", isCorrect: false },
      { id: generateId(), label: "B", text: "512", isCorrect: false },
      { id: generateId(), label: "C", text: "256", isCorrect: true },
      { id: generateId(), label: "D", text: "1024", isCorrect: false }
    ],
    explanation: "1 byte = 8 bit. Số tổ hợp nhị phân là 2^8 = 256.",
    createdAt: Date.now(),
    seenCount: 0
  },
  {
    id: generateId(),
    text: "Các đơn vị đo lường khả năng lưu trữ thông tin là:",
    difficulty: "Easy",
    choices: [
      { id: generateId(), label: "A", text: "Bit, Byte, KG, MB, GB", isCorrect: false },
      { id: generateId(), label: "B", text: "Boolean, Byte, MB", isCorrect: false },
      { id: generateId(), label: "C", text: "Đĩa cứng, ổ nhớ", isCorrect: false },
      { id: generateId(), label: "D", text: "Byte, Kbyte, MB, GB", isCorrect: true }
    ],
    createdAt: Date.now(),
    seenCount: 0
  },
  {
    id: generateId(),
    text: "Số 10B thuộc hệ đếm nào?",
    difficulty: "Medium",
    choices: [
      { id: generateId(), label: "A", text: "Nhị phân", isCorrect: false },
      { id: generateId(), label: "B", text: "Thập lục phân", isCorrect: true },
      { id: generateId(), label: "C", text: "Bát phân", isCorrect: false },
      { id: generateId(), label: "D", text: "Thập phân", isCorrect: false }
    ],
    explanation: "Chữ cái B chỉ xuất hiện trong hệ thập lục phân (Hexadecimal).",
    createdAt: Date.now(),
    seenCount: 0
  },
  {
    id: generateId(),
    text: "Thiết bị nào trong các thiết bị sau là thiết bị đầu ra?",
    difficulty: "Easy",
    choices: [
      { id: generateId(), label: "A", text: "Bàn phím", isCorrect: false },
      { id: generateId(), label: "B", text: "Con chuột", isCorrect: false },
      { id: generateId(), label: "C", text: "Máy in", isCorrect: true },
      { id: generateId(), label: "D", text: "Máy Scan", isCorrect: false }
    ],
    createdAt: Date.now(),
    seenCount: 0
  },
  {
    id: generateId(),
    text: "Phát biểu nào sau đây là SAI về hệ đếm?",
    difficulty: "Hard",
    choices: [
      { id: generateId(), label: "A", text: "Hệ nhị phân có 2 chữ số cơ bản là 0 và 1", isCorrect: false },
      { id: generateId(), label: "B", text: "Hệ thập lục phân có 16 chữ số cơ bản từ 0-9 và A-F", isCorrect: false },
      { id: generateId(), label: "C", text: "Hệ thập phân có 10 chữ số cơ bản là: 0,1,2,3,4,5,6,7,8,9,10", isCorrect: true },
      { id: generateId(), label: "D", text: "Hệ bát phân gồm có 0,1,2,3,4,5,6,7", isCorrect: false }
    ],
    explanation: "Hệ thập phân chỉ có các chữ số từ 0 đến 9. Số 10 là kết hợp của 1 và 0.",
    createdAt: Date.now(),
    seenCount: 0
  },
  {
    id: generateId(),
    text: "Thành phần nào sau đây không thuộc bộ xử lý trung tâm (CPU)?",
    difficulty: "Medium",
    choices: [
      { id: generateId(), label: "A", text: "Khối tính toán số học/logic (ALU)", isCorrect: false },
      { id: generateId(), label: "B", text: "Khối điều khiển (CU)", isCorrect: false },
      { id: generateId(), label: "C", text: "Bộ nhớ trong (RAM/ROM)", isCorrect: true },
      { id: generateId(), label: "D", text: "Thanh ghi (Register)", isCorrect: false }
    ],
    createdAt: Date.now(),
    seenCount: 0
  },
  {
    id: generateId(),
    text: "Đơn vị lưu trữ thông tin nhỏ nhất là:",
    difficulty: "Easy",
    choices: [
      { id: generateId(), label: "A", text: "Byte", isCorrect: false },
      { id: generateId(), label: "B", text: "Bit", isCorrect: true },
      { id: generateId(), label: "C", text: "Hz", isCorrect: false },
      { id: generateId(), label: "D", text: "Ký tự", isCorrect: false }
    ],
    createdAt: Date.now(),
    seenCount: 0
  },
  {
    id: generateId(),
    text: "Trong máy tính, phương án nào sau đây là sắp xếp tăng dần của dung lượng bộ nhớ?",
    difficulty: "Medium",
    choices: [
      { id: generateId(), label: "A", text: "B, MB, KB, GB", isCorrect: false },
      { id: generateId(), label: "B", text: "MB, KB, B, GB", isCorrect: false },
      { id: generateId(), label: "C", text: "GB, MB, KB, B", isCorrect: false },
      { id: generateId(), label: "D", text: "B, KB, MB, GB", isCorrect: true }
    ],
    createdAt: Date.now(),
    seenCount: 0
  }
];
