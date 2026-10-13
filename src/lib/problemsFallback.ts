export const FALLBACK_LANGUAGES = [
  { id: "lang-py", name: "Python 3", slug: "python", monacoLang: "python", judge0Id: 71, isEnabled: true },
  { id: "lang-js", name: "JavaScript", slug: "javascript", monacoLang: "javascript", judge0Id: 63, isEnabled: true },
  { id: "lang-ts", name: "TypeScript", slug: "typescript", monacoLang: "typescript", judge0Id: 74, isEnabled: true },
  { id: "lang-cpp", name: "C++", slug: "cpp", monacoLang: "cpp", judge0Id: 54, isEnabled: true },
  { id: "lang-c", name: "C", slug: "c", monacoLang: "c", judge0Id: 50, isEnabled: true },
  { id: "lang-java", name: "Java", slug: "java", monacoLang: "java", judge0Id: 62, isEnabled: true },
  { id: "lang-go", name: "Go", slug: "go", monacoLang: "go", judge0Id: 60, isEnabled: true },
  { id: "lang-rust", name: "Rust", slug: "rust", monacoLang: "rust", judge0Id: 73, isEnabled: true },
  { id: "lang-cs", name: "C#", slug: "csharp", monacoLang: "csharp", judge0Id: 51, isEnabled: true },
];

export const FALLBACK_PROBLEMS: Record<string, any> = {
  "two-sum": {
    id: "p-two-sum",
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "EASY",
    orderIndex: 1,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    companies: "Google, Amazon, Meta, Microsoft",
    hints: JSON.stringify([
      "Can you solve this in a single pass using a hash map?",
      "For each number x, calculate complement = target - x and check if it exists in your map.",
    ]),
    editorial: "Store each value and its index in a hash map. For each element nums[i], look up target - nums[i] in O(1) time.\n\nTime Complexity: O(N)\nSpace Complexity: O(N)",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly one solution***, and you may not use the *same* element twice.

You can return the answer in any order.

### Example 1:
\`\`\`text
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

### Example 2:
\`\`\`text
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

### Constraints:
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- **Only one valid answer exists.**
`,
    tags: [
      { tag: { id: "t1", name: "Array", slug: "array" } },
      { tag: { id: "t2", name: "Hash Table", slug: "hash-table" } },
    ],
    starterCodes: [
      {
        id: "sc-py",
        language: FALLBACK_LANGUAGES[0],
        code: `import sys, json

def twoSum(nums: list[int], target: int) -> list[int]:
    # Write your solution here
    pass

if __name__ == '__main__':
    lines = sys.stdin.read().strip().split('\\n')
    if len(lines) >= 2:
        nums = json.loads(lines[0])
        target = int(lines[1])
        print(json.dumps(twoSum(nums, target), separators=(',', ':')))
`,
      },
      {
        id: "sc-js",
        language: FALLBACK_LANGUAGES[1],
        code: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your solution here
}

const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (input.length >= 2) {
  const nums = JSON.parse(input[0]);
  const target = parseInt(input[1]);
  console.log(JSON.stringify(twoSum(nums, target)));
}
`,
      },
      {
        id: "sc-ts",
        language: FALLBACK_LANGUAGES[2],
        code: `function twoSum(nums: number[], target: number): number[] {
  // Write your solution here
  return [];
}
`,
      },
      {
        id: "sc-cpp",
        language: FALLBACK_LANGUAGES[3],
        code: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <string>
#include <sstream>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};

int main() {
    // Standard I/O runner
    return 0;
}
`,
      },
      {
        id: "sc-java",
        language: FALLBACK_LANGUAGES[5],
        code: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}
`,
      },
    ],
    testCases: [
      {
        id: "tc1",
        input: `[2,7,11,15]\n9`,
        expectedOutput: `[0,1]`,
        isSample: true,
        orderIndex: 1,
        explanation: `nums[0] + nums[1] == 9, return [0, 1].`,
      },
      {
        id: "tc2",
        input: `[3,2,4]\n6`,
        expectedOutput: `[1,2]`,
        isSample: true,
        orderIndex: 2,
        explanation: `nums[1] + nums[2] == 6, return [1, 2].`,
      },
      {
        id: "tc3",
        input: `[3,3]\n6`,
        expectedOutput: `[0,1]`,
        isSample: true,
        orderIndex: 3,
        explanation: `nums[0] + nums[1] == 6, return [0, 1].`,
      },
    ],
  },
  "valid-parentheses": {
    id: "p-valid-parentheses",
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "EASY",
    orderIndex: 2,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    companies: "Google, Meta, Amazon, Bloomberg",
    hints: JSON.stringify([
      "Use a stack to keep track of opening brackets.",
      "When encountering a closing bracket, check if it matches the top of the stack.",
    ]),
    editorial: "Iterate through string characters pushing opening brackets onto stack. For each closing bracket, pop from stack and check match.\n\nTime Complexity: O(N)\nSpace Complexity: O(N)",
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

### Example 1:
\`\`\`text
Input: s = "()"
Output: true
\`\`\`

### Example 2:
\`\`\`text
Input: s = "()[]{}"
Output: true
\`\`\`

### Example 3:
\`\`\`text
Input: s = "(]"
Output: false
\`\`\`
`,
    tags: [
      { tag: { id: "t3", name: "String", slug: "string" } },
      { tag: { id: "t4", name: "Stack", slug: "stack" } },
    ],
    starterCodes: [
      {
        id: "sc-vp-py",
        language: FALLBACK_LANGUAGES[0],
        code: `import sys

def isValid(s: str) -> bool:
    # Write your solution here
    pass

if __name__ == '__main__':
    s = sys.stdin.read().strip()
    print("true" if isValid(s) else "false")
`,
      },
      {
        id: "sc-vp-js",
        language: FALLBACK_LANGUAGES[1],
        code: `function isValid(s) {
  // Write your solution here
}

const fs = require('fs');
const s = fs.readFileSync(0, 'utf-8').trim();
console.log(isValid(s) ? 'true' : 'false');
`,
      },
    ],
    testCases: [
      {
        id: "tc-vp-1",
        input: `"()"`,
        expectedOutput: `true`,
        isSample: true,
        orderIndex: 1,
        explanation: `Valid pair.`,
      },
      {
        id: "tc-vp-2",
        input: `"()[]{}"`,
        expectedOutput: `true`,
        isSample: true,
        orderIndex: 2,
        explanation: `All pairs close properly.`,
      },
      {
        id: "tc-vp-3",
        input: `"(]"`,
        expectedOutput: `false`,
        isSample: true,
        orderIndex: 3,
        explanation: `Mismatched brackets.`,
      },
    ],
  },
  "longest-substring-without-repeating-characters": {
    id: "p-longest-sub",
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "MEDIUM",
    orderIndex: 3,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    companies: "Amazon, Google, Meta, Apple",
    hints: JSON.stringify([
      "Can you maintain a sliding window [left, right] of characters seen so far?",
      "Use a hash map or array to record the last seen index of each character.",
    ]),
    editorial: "Sliding window with hash map storing latest position of each character.\n\nTime: O(N)\nSpace: O(min(N, M))",
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.

### Example 1:
\`\`\`text
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.
\`\`\`

### Example 2:
\`\`\`text
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.
\`\`\`
`,
    tags: [
      { tag: { id: "t2", name: "Hash Table", slug: "hash-table" } },
      { tag: { id: "t5", name: "Two Pointers", slug: "two-pointers" } },
    ],
    starterCodes: [
      {
        id: "sc-ls-py",
        language: FALLBACK_LANGUAGES[0],
        code: `import sys

def lengthOfLongestSubstring(s: str) -> int:
    # Write your solution here
    return 0

if __name__ == '__main__':
    s = sys.stdin.read().strip()
    print(lengthOfLongestSubstring(s))
`,
      },
    ],
    testCases: [
      {
        id: "tc-ls-1",
        input: `"abcabcbb"`,
        expectedOutput: `3`,
        isSample: true,
        orderIndex: 1,
        explanation: `Longest substring is "abc".`,
      },
      {
        id: "tc-ls-2",
        input: `"bbbbb"`,
        expectedOutput: `1`,
        isSample: true,
        orderIndex: 2,
        explanation: `Longest substring is "b".`,
      },
    ],
  },
  "trapping-rain-water": {
    id: "p-trapping-water",
    title: "Trapping Rain Water",
    slug: "trapping-rain-water",
    difficulty: "HARD",
    orderIndex: 5,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    companies: "Google, Amazon, Meta, Bloomberg",
    hints: JSON.stringify([
      "Can you use two pointers moving inward from both sides?",
      "Keep track of left_max and right_max as you iterate.",
    ]),
    editorial: "Two-pointer approach maintaining maximum heights seen so far from left and right.\n\nTime: O(N)\nSpace: O(1)",
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.

### Example 1:
\`\`\`text
Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
Explanation: The elevation map traps 6 units of rain water.
\`\`\`
`,
    tags: [
      { tag: { id: "t1", name: "Array", slug: "array" } },
      { tag: { id: "t5", name: "Two Pointers", slug: "two-pointers" } },
    ],
    starterCodes: [],
    testCases: [
      {
        id: "tc-tr-1",
        input: `[0,1,0,2,1,0,1,3,2,1,2,1]`,
        expectedOutput: `6`,
        isSample: true,
        orderIndex: 1,
        explanation: `6 units of water trapped.`,
      },
    ],
  },
};
