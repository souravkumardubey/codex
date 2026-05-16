import { PrismaClient, Difficulty, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@codex.dev' },
    update: {},
    create: {
      email: 'admin@codex.dev',
      username: 'admin',
      passwordHash: adminHash,
      role: UserRole.ADMIN,
    },
  });

  // Create demo user
  const userHash = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@codex.dev' },
    update: {},
    create: {
      email: 'demo@codex.dev',
      username: 'demo',
      passwordHash: userHash,
      role: UserRole.USER,
    },
  });

  // Seed challenges
  const challenges = [
    {
      title: 'Two Sum',
      slug: 'two-sum',
      difficulty: Difficulty.EASY,
      description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

**Constraints:**
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9`,
      constraints: '2 <= nums.length <= 10^4',
      examples: [
        { input: 'nums = [2,7,11,15], target = 9', output: '[0, 1]' },
        { input: 'nums = [3,2,4], target = 6', output: '[1, 2]' },
        { input: 'nums = [3,3], target = 6', output: '[0, 1]' },
      ],
      tags: ['array', 'hash-table'],
      testCases: {
        create: [
          { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', order: 0 },
          { input: '[3,2,4]\n6', expectedOutput: '[1,2]', order: 1 },
          { input: '[3,3]\n6', expectedOutput: '[0,1]', order: 2 },
          { input: '[1,2,3,4,5]\n9', expectedOutput: '[3,4]', order: 3, hidden: true },
          { input: '[-1,-2,-3,-4,-5]\n-8', expectedOutput: '[2,4]', order: 4, hidden: true },
        ],
      },
    },
    {
      title: 'Reverse a String',
      slug: 'reverse-string',
      difficulty: Difficulty.EASY,
      description: `Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array in-place with O(1) extra memory.

**Example 1:**
\`\`\`
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]
\`\`\`

**Example 2:**
\`\`\`
Input: s = ["H","a","n","n","a","h"]
Output: ["h","a","n","n","a","H"]
\`\`\`

**Constraints:**
- 1 <= s.length <= 10^5
- s[i] is a printable ascii character.`,
      constraints: '1 <= s.length <= 10^5',
      examples: [
        { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
        { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' },
      ],
      tags: ['string', 'two-pointers'],
      testCases: {
        create: [
          { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]', order: 0 },
          { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]', order: 1 },
          { input: '["a"]', expectedOutput: '["a"]', order: 2 },
          { input: '["a","b","c"]', expectedOutput: '["c","b","a"]', order: 3, hidden: true },
          { input: '["1","2","3","4"]', expectedOutput: '["4","3","2","1"]', order: 4, hidden: true },
        ],
      },
    },
    {
      title: 'Palindrome Number',
      slug: 'palindrome-number',
      difficulty: Difficulty.EASY,
      description: `Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

An integer is a palindrome when it reads the same forward and backward.

**Example 1:**
\`\`\`
Input: x = 121
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: x = -121
Output: false
Explanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.
\`\`\`

**Constraints:**
- -2^31 <= x <= 2^31 - 1`,
      constraints: '-2^31 <= x <= 2^31 - 1',
      examples: [
        { input: 'x = 121', output: 'true' },
        { input: 'x = -121', output: 'false' },
        { input: 'x = 10', output: 'false' },
      ],
      tags: ['math'],
      testCases: {
        create: [
          { input: '121', expectedOutput: 'true', order: 0 },
          { input: '-121', expectedOutput: 'false', order: 1 },
          { input: '10', expectedOutput: 'false', order: 2 },
          { input: '0', expectedOutput: 'true', order: 3, hidden: true },
          { input: '12321', expectedOutput: 'true', order: 4, hidden: true },
        ],
      },
    },
    {
      title: 'Valid Parentheses',
      slug: 'valid-parentheses',
      difficulty: Difficulty.EASY,
      description: `Given a string \`s\` containing just the characters \`'('\`, \')'\`, \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Example 1:**
\`\`\`
Input: s = "()"
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: s = "()[]{}"
Output: true
\`\`\`

**Constraints:**
- 1 <= s.length <= 10^4
- s consists of parentheses only '()[]{}'.`,
      constraints: '1 <= s.length <= 10^4',
      examples: [
        { input: 's = "()"', output: 'true' },
        { input: 's = "()[]{}"', output: 'true' },
        { input: 's = "(]"', output: 'false' },
      ],
      tags: ['string', 'stack'],
      testCases: {
        create: [
          { input: '()', expectedOutput: 'true', order: 0 },
          { input: '()[]{}', expectedOutput: 'true', order: 1 },
          { input: '(]', expectedOutput: 'false', order: 2 },
          { input: '([)]', expectedOutput: 'false', order: 3, hidden: true },
          { input: '{[]}', expectedOutput: 'true', order: 4, hidden: true },
        ],
      },
    },
    {
      title: 'Fibonacci Number',
      slug: 'fibonacci-number',
      difficulty: Difficulty.EASY,
      description: `The Fibonacci numbers, commonly denoted \`F(n)\` form a sequence, where each number is the sum of the two preceding ones, starting from \`0\` and \`1\`.

\`\`\`
F(0) = 0, F(1) = 1
F(n) = F(n - 1) + F(n - 2), for n > 1.
\`\`\`

Given \`n\`, calculate \`F(n)\`.

**Example 1:**
\`\`\`
Input: n = 2
Output: 1
Explanation: F(2) = F(1) + F(0) = 1 + 0 = 1.
\`\`\`

**Constraints:**
- 0 <= n <= 30`,
      constraints: '0 <= n <= 30',
      examples: [
        { input: 'n = 2', output: '1' },
        { input: 'n = 3', output: '2' },
        { input: 'n = 4', output: '3' },
      ],
      tags: ['math', 'dynamic-programming', 'recursion'],
      testCases: {
        create: [
          { input: '2', expectedOutput: '1', order: 0 },
          { input: '3', expectedOutput: '2', order: 1 },
          { input: '4', expectedOutput: '3', order: 2 },
          { input: '0', expectedOutput: '0', order: 3, hidden: true },
          { input: '10', expectedOutput: '55', order: 4, hidden: true },
        ],
      },
    },
    {
      title: 'Merge Two Sorted Lists',
      slug: 'merge-two-sorted-lists',
      difficulty: Difficulty.EASY,
      description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.

**Example 1:**
\`\`\`
Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]
\`\`\`

**Constraints:**
- The number of nodes in both lists is in the range [0, 50].
- -100 <= Node.val <= 100
- Both list1 and list2 are sorted in non-decreasing order.`,
      constraints: '0 <= nodes <= 50, -100 <= Node.val <= 100',
      examples: [
        { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' },
        { input: 'list1 = [], list2 = []', output: '[]' },
        { input: 'list1 = [], list2 = [0]', output: '[0]' },
      ],
      tags: ['linked-list', 'recursion'],
      testCases: {
        create: [
          { input: '[1,2,4]\n[1,3,4]', expectedOutput: '[1,1,2,3,4,4]', order: 0 },
          { input: '[]\n[]', expectedOutput: '[]', order: 1 },
          { input: '[]\n[0]', expectedOutput: '[0]', order: 2 },
          { input: '[1]\n[2]', expectedOutput: '[1,2]', order: 3, hidden: true },
          { input: '[1,3,5]\n[2,4,6]', expectedOutput: '[1,2,3,4,5,6]', order: 4, hidden: true },
        ],
      },
    },
    {
      title: 'Maximum Subarray',
      slug: 'maximum-subarray',
      difficulty: Difficulty.MEDIUM,
      description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

**Example 1:**
\`\`\`
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.
\`\`\`

**Constraints:**
- 1 <= nums.length <= 10^5
- -10^4 <= nums[i] <= 10^4`,
      constraints: '1 <= nums.length <= 10^5',
      examples: [
        { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6' },
        { input: 'nums = [1]', output: '1' },
        { input: 'nums = [5,4,-1,7,8]', output: '23' },
      ],
      tags: ['array', 'divide-and-conquer', 'dynamic-programming'],
      testCases: {
        create: [
          { input: '-2,1,-3,4,-1,2,1,-5,4', expectedOutput: '6', order: 0 },
          { input: '1', expectedOutput: '1', order: 1 },
          { input: '5,4,-1,7,8', expectedOutput: '23', order: 2 },
          { input: '-1', expectedOutput: '-1', order: 3, hidden: true },
          { input: '-2,-1', expectedOutput: '-1', order: 4, hidden: true },
        ],
      },
    },
  ];

  for (const challenge of challenges) {
    const { testCases, ...challengeData } = challenge;
    await prisma.challenge.upsert({
      where: { slug: challengeData.slug },
      update: {},
      create: {
        ...challengeData,
        testCases,
      },
    });
  }

  console.log('Seed completed successfully');
  console.log(`Admin: admin@codex.dev / admin123`);
  console.log(`Demo: demo@codex.dev / user123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
