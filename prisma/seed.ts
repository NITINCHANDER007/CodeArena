import { PrismaClient } from "@prisma/client";
import { Difficulty, Role } from "../src/lib/types";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Clear existing records in proper order
  await prisma.submission.deleteMany();
  await prisma.starterCode.deleteMany();
  await prisma.testCase.deleteMany();
  await prisma.problemTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.language.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash("AdminPassword123!", salt);
  const userPasswordHash = await bcrypt.hash("UserPassword123!", salt);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      username: "admin",
      email: "admin@codearena.dev",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      name: "John Coder",
      username: "johncoder",
      email: "coder@codearena.dev",
      passwordHash: userPasswordHash,
      role: Role.USER,
      isVerified: true,
    },
  });

  console.log(`👤 Users seeded: ${admin.email} (Admin), ${demoUser.email} (User)`);

  // 3. Seed Languages
  const pythonLang = await prisma.language.create({
    data: {
      name: "Python 3",
      slug: "python",
      judge0Id: 71,
      monacoLang: "python",
      version: "Python 3.11+",
      isEnabled: true,
    },
  });

  const jsLang = await prisma.language.create({
    data: {
      name: "JavaScript",
      slug: "javascript",
      judge0Id: 63,
      monacoLang: "javascript",
      version: "Node.js (Latest)",
      isEnabled: true,
    },
  });

  const tsLang = await prisma.language.create({
    data: {
      name: "TypeScript",
      slug: "typescript",
      judge0Id: 74,
      monacoLang: "typescript",
      version: "TypeScript 5",
      isEnabled: true,
    },
  });

  const cppLang = await prisma.language.create({
    data: {
      name: "C++",
      slug: "cpp",
      judge0Id: 54,
      monacoLang: "cpp",
      version: "GCC (C++17)",
      isEnabled: true,
    },
  });

  const cLang = await prisma.language.create({
    data: {
      name: "C",
      slug: "c",
      judge0Id: 50,
      monacoLang: "c",
      version: "GCC (C11)",
      isEnabled: true,
    },
  });

  const javaLang = await prisma.language.create({
    data: {
      name: "Java",
      slug: "java",
      judge0Id: 62,
      monacoLang: "java",
      version: "OpenJDK (Java 17)",
      isEnabled: true,
    },
  });

  const goLang = await prisma.language.create({
    data: {
      name: "Go",
      slug: "go",
      judge0Id: 60,
      monacoLang: "go",
      version: "Go 1.20",
      isEnabled: true,
    },
  });

  const rustLang = await prisma.language.create({
    data: {
      name: "Rust",
      slug: "rust",
      judge0Id: 73,
      monacoLang: "rust",
      version: "Rust 1.70",
      isEnabled: true,
    },
  });

  const csharpLang = await prisma.language.create({
    data: {
      name: "C#",
      slug: "csharp",
      judge0Id: 51,
      monacoLang: "csharp",
      version: ".NET 7 / Mono",
      isEnabled: true,
    },
  });

  console.log("🌐 Languages seeded: Python 3, JavaScript, TypeScript, C++, C, Java, Go, Rust, C#");

  // 4. Seed Tags
  const tagArray = await prisma.tag.create({ data: { name: "Array", slug: "array" } });
  const tagHash = await prisma.tag.create({ data: { name: "Hash Table", slug: "hash-table" } });
  const tagString = await prisma.tag.create({ data: { name: "String", slug: "string" } });
  const tagTwoPointers = await prisma.tag.create({ data: { name: "Two Pointers", slug: "two-pointers" } });
  const tagStack = await prisma.tag.create({ data: { name: "Stack", slug: "stack" } });
  const tagSlidingWindow = await prisma.tag.create({ data: { name: "Sliding Window", slug: "sliding-window" } });
  const tagDP = await prisma.tag.create({ data: { name: "Dynamic Programming", slug: "dynamic-programming" } });

  console.log("🏷️ Tags seeded");

  // 5. Seed 5 Sample Problems

  // PROBLEM 1: Two Sum
  const p1 = await prisma.problem.create({
    data: {
      title: "Two Sum",
      slug: "two-sum",
      difficulty: Difficulty.EASY,
      orderIndex: 1,
      timeLimitMs: 2000,
      memoryLimitMb: 256,
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

### Example 3:
\`\`\`text
Input: nums = [3,3], target = 6
Output: [0,1]
\`\`\`

### Constraints:
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- **Only one valid answer exists.**
`,
      tags: {
        create: [
          { tagId: tagArray.id },
          { tagId: tagHash.id },
        ],
      },
      starterCodes: {
        create: [
          {
            languageId: pythonLang.id,
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
            languageId: jsLang.id,
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
            languageId: cppLang.id,
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
    string line;
    if (getline(cin, line)) {
        vector<int> nums;
        stringstream ss(line.substr(1, line.size() - 2));
        string item;
        while (getline(ss, item, ',')) {
            nums.push_back(stoi(item));
        }
        int target;
        cin >> target;
        Solution s;
        vector<int> res = s.twoSum(nums, target);
        cout << "[" << res[0] << "," << res[1] << "]" << endl;
    }
    return 0;
}
`,
          },
          {
            languageId: javaLang.id,
            code: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().trim();
        line = line.substring(1, line.length() - 1);
        String[] parts = line.split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            nums[i] = Integer.parseInt(parts[i].trim());
        }
        int target = sc.nextInt();
        int[] res = twoSum(nums, target);
        System.out.println("[" + res[0] + "," + res[1] + "]");
    }
}
`,
          },
        ],
      },
      testCases: {
        create: [
          {
            input: `[2,7,11,15]\n9`,
            expectedOutput: `[0,1]`,
            isSample: true,
            isHidden: false,
            orderIndex: 1,
            explanation: `nums[0] + nums[1] = 2 + 7 = 9`,
          },
          {
            input: `[3,2,4]\n6`,
            expectedOutput: `[1,2]`,
            isSample: true,
            isHidden: false,
            orderIndex: 2,
            explanation: `nums[1] + nums[2] = 2 + 4 = 6`,
          },
          {
            input: `[3,3]\n6`,
            expectedOutput: `[0,1]`,
            isSample: false,
            isHidden: true,
            orderIndex: 3,
            explanation: `Hidden test case with identical duplicate values`,
          },
          {
            input: `[1,5,8,10,14]\n19`,
            expectedOutput: `[1,4]`,
            isSample: false,
            isHidden: true,
            orderIndex: 4,
            explanation: `Hidden test case`,
          },
        ],
      },
    },
  });

  // PROBLEM 2: Valid Parentheses
  const p2 = await prisma.problem.create({
    data: {
      title: "Valid Parentheses",
      slug: "valid-parentheses",
      difficulty: Difficulty.EASY,
      orderIndex: 2,
      timeLimitMs: 2000,
      memoryLimitMb: 256,
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

### Constraints:
- \`1 <= s.length <= 10^4\`
- \`s\` consists of parentheses only \`'()[]{}'\`.
`,
      tags: {
        create: [
          { tagId: tagString.id },
          { tagId: tagStack.id },
        ],
      },
      starterCodes: {
        create: [
          {
            languageId: pythonLang.id,
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
            languageId: jsLang.id,
            code: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Write your solution here
}

const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
console.log(isValid(input));
`,
          },
          {
            languageId: cppLang.id,
            code: `#include <iostream>
#include <stack>
#include <string>

using namespace std;

class Solution {
public:
    bool isValid(string s) {
        // Write your solution here
        return false;
    }
};

int main() {
    string s;
    if (cin >> s) {
        Solution sol;
        cout << (sol.isValid(s) ? "true" : "false") << endl;
    }
    return 0;
}
`,
          },
          {
            languageId: javaLang.id,
            code: `import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        // Write your solution here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s = sc.next();
            System.out.println(isValid(s));
        }
    }
}
`,
          },
        ],
      },
      testCases: {
        create: [
          {
            input: `()`,
            expectedOutput: `true`,
            isSample: true,
            isHidden: false,
            orderIndex: 1,
            explanation: `Parentheses are properly matched.`,
          },
          {
            input: `()[]{}`,
            expectedOutput: `true`,
            isSample: true,
            isHidden: false,
            orderIndex: 2,
            explanation: `All three pairs are valid.`,
          },
          {
            input: `(]`,
            expectedOutput: `false`,
            isSample: true,
            isHidden: false,
            orderIndex: 3,
            explanation: `Mismatched bracket types.`,
          },
          {
            input: `([{}])`,
            expectedOutput: `true`,
            isSample: false,
            isHidden: true,
            orderIndex: 4,
            explanation: `Nested balanced brackets.`,
          },
          {
            input: `]`,
            expectedOutput: `false`,
            isSample: false,
            isHidden: true,
            orderIndex: 5,
            explanation: `Closing bracket without opening.`,
          },
        ],
      },
    },
  });

  // PROBLEM 3: Longest Substring Without Repeating Characters
  const p3 = await prisma.problem.create({
    data: {
      title: "Longest Substring Without Repeating Characters",
      slug: "longest-substring-without-repeating-characters",
      difficulty: Difficulty.MEDIUM,
      orderIndex: 3,
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      description: `Given a string \`s\`, find the length of the **longest substring** without duplicate characters.

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

### Example 3:
\`\`\`text
Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.
Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.
\`\`\`

### Constraints:
- \`0 <= s.length <= 5 * 10^4\`
- \`s\` consists of English letters, digits, symbols and spaces.
`,
      tags: {
        create: [
          { tagId: tagHash.id },
          { tagId: tagString.id },
          { tagId: tagSlidingWindow.id },
        ],
      },
      starterCodes: {
        create: [
          {
            languageId: pythonLang.id,
            code: `import sys

def lengthOfLongestSubstring(s: str) -> int:
    # Write your solution here
    pass

if __name__ == '__main__':
    s = sys.stdin.read().rstrip('\\r\\n')
    print(lengthOfLongestSubstring(s))
`,
          },
          {
            languageId: jsLang.id,
            code: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // Write your solution here
}

const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').replace(/\\r?\\n$/, '');
console.log(lengthOfLongestSubstring(input));
`,
          },
          {
            languageId: cppLang.id,
            code: `#include <iostream>
#include <string>
#include <unordered_map>
#include <algorithm>

using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Write your solution here
        return 0;
    }
};

int main() {
    string s;
    getline(cin, s);
    Solution sol;
    cout << sol.lengthOfLongestSubstring(s) << endl;
    return 0;
}
`,
          },
          {
            languageId: javaLang.id,
            code: `import java.util.*;

public class Main {
    public static int lengthOfLongestSubstring(String s) {
        // Write your solution here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        System.out.println(lengthOfLongestSubstring(s));
    }
}
`,
          },
        ],
      },
      testCases: {
        create: [
          {
            input: `abcabcbb`,
            expectedOutput: `3`,
            isSample: true,
            isHidden: false,
            orderIndex: 1,
            explanation: `"abc" has length 3.`,
          },
          {
            input: `bbbbb`,
            expectedOutput: `1`,
            isSample: true,
            isHidden: false,
            orderIndex: 2,
            explanation: `"b" has length 1.`,
          },
          {
            input: `pwwkew`,
            expectedOutput: `3`,
            isSample: true,
            isHidden: false,
            orderIndex: 3,
            explanation: `"wke" has length 3.`,
          },
          {
            input: ``,
            expectedOutput: `0`,
            isSample: false,
            isHidden: true,
            orderIndex: 4,
            explanation: `Empty string edge case.`,
          },
          {
            input: `aab`,
            expectedOutput: `2`,
            isSample: false,
            isHidden: true,
            orderIndex: 5,
            explanation: `"ab" has length 2.`,
          },
        ],
      },
    },
  });

  // PROBLEM 4: Container With Most Water
  const p4 = await prisma.problem.create({
    data: {
      title: "Container With Most Water",
      slug: "container-with-most-water",
      difficulty: Difficulty.MEDIUM,
      orderIndex: 4,
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i-th\` line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return *the maximum amount of water a container can store*.

**Notice** that you may not slant the container.

### Example 1:
\`\`\`text
Input: height = [1,8,6,2,5,4,8,3,7]
Output: 49
Explanation: The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water (between index 1 and 8) is 49.
\`\`\`

### Example 2:
\`\`\`text
Input: height = [1,1]
Output: 1
\`\`\`

### Constraints:
- \`n == height.length\`
- \`2 <= n <= 10^5\`
- \`0 <= height[i] <= 10^4\`
`,
      tags: {
        create: [
          { tagId: tagArray.id },
          { tagId: tagTwoPointers.id },
        ],
      },
      starterCodes: {
        create: [
          {
            languageId: pythonLang.id,
            code: `import sys, json

def maxArea(height: list[int]) -> int:
    # Write your solution here
    pass

if __name__ == '__main__':
    height = json.loads(sys.stdin.read().strip())
    print(maxArea(height))
`,
          },
          {
            languageId: jsLang.id,
            code: `/**
 * @param {number[]} height
 * @return {number}
 */
function maxArea(height) {
  // Write your solution here
}

const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
const height = JSON.parse(input);
console.log(maxArea(height));
`,
          },
          {
            languageId: cppLang.id,
            code: `#include <iostream>
#include <vector>
#include <sstream>
#include <algorithm>

using namespace std;

class Solution {
public:
    int maxArea(vector<int>& height) {
        // Write your solution here
        return 0;
    }
};

int main() {
    string line;
    if (getline(cin, line)) {
        vector<int> height;
        stringstream ss(line.substr(1, line.size() - 2));
        string item;
        while (getline(ss, item, ',')) {
            height.push_back(stoi(item));
        }
        Solution s;
        cout << s.maxArea(height) << endl;
    }
    return 0;
}
`,
          },
          {
            languageId: javaLang.id,
            code: `import java.util.*;

public class Main {
    public static int maxArea(int[] height) {
        // Write your solution here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().trim();
        line = line.substring(1, line.length() - 1);
        String[] parts = line.split(",");
        int[] height = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            height[i] = Integer.parseInt(parts[i].trim());
        }
        System.out.println(maxArea(height));
    }
}
`,
          },
        ],
      },
      testCases: {
        create: [
          {
            input: `[1,8,6,2,5,4,8,3,7]`,
            expectedOutput: `49`,
            isSample: true,
            isHidden: false,
            orderIndex: 1,
            explanation: `Indices 1 and 8 give width 7 and height min(8, 7) = 7 -> 7 * 7 = 49.`,
          },
          {
            input: `[1,1]`,
            expectedOutput: `1`,
            isSample: true,
            isHidden: false,
            orderIndex: 2,
            explanation: `Indices 0 and 1 give area 1.`,
          },
          {
            input: `[4,3,2,1,4]`,
            expectedOutput: `16`,
            isSample: false,
            isHidden: true,
            orderIndex: 3,
            explanation: `Edges 0 and 4 give width 4 and height 4 -> 16.`,
          },
          {
            input: `[1,2,1]`,
            expectedOutput: `2`,
            isSample: false,
            isHidden: true,
            orderIndex: 4,
            explanation: `Hidden test case.`,
          },
        ],
      },
    },
  });

  // PROBLEM 5: Trapping Rain Water
  const p5 = await prisma.problem.create({
    data: {
      title: "Trapping Rain Water",
      slug: "trapping-rain-water",
      difficulty: Difficulty.HARD,
      orderIndex: 5,
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.

### Example 1:
\`\`\`text
Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
Explanation: The elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.
\`\`\`

### Example 2:
\`\`\`text
Input: height = [4,2,0,3,2,5]
Output: 9
\`\`\`

### Constraints:
- \`n == height.length\`
- \`1 <= n <= 2 * 10^4\`
- \`0 <= height[i] <= 10^5\`
`,
      tags: {
        create: [
          { tagId: tagArray.id },
          { tagId: tagTwoPointers.id },
          { tagId: tagStack.id },
          { tagId: tagDP.id },
        ],
      },
      starterCodes: {
        create: [
          {
            languageId: pythonLang.id,
            code: `import sys, json

def trap(height: list[int]) -> int:
    # Write your solution here
    pass

if __name__ == '__main__':
    height = json.loads(sys.stdin.read().strip())
    print(trap(height))
`,
          },
          {
            languageId: jsLang.id,
            code: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
  // Write your solution here
}

const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
const height = JSON.parse(input);
console.log(trap(height));
`,
          },
          {
            languageId: cppLang.id,
            code: `#include <iostream>
#include <vector>
#include <sstream>
#include <algorithm>

using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        // Write your solution here
        return 0;
    }
};

int main() {
    string line;
    if (getline(cin, line)) {
        vector<int> height;
        stringstream ss(line.substr(1, line.size() - 2));
        string item;
        while (getline(ss, item, ',')) {
            height.push_back(stoi(item));
        }
        Solution s;
        cout << s.trap(height) << endl;
    }
    return 0;
}
`,
          },
          {
            languageId: javaLang.id,
            code: `import java.util.*;

public class Main {
    public static int trap(int[] height) {
        // Write your solution here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().trim();
        line = line.substring(1, line.length() - 1);
        String[] parts = line.split(",");
        int[] height = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            height[i] = Integer.parseInt(parts[i].trim());
        }
        System.out.println(trap(height));
    }
}
`,
          },
        ],
      },
      testCases: {
        create: [
          {
            input: `[0,1,0,2,1,0,1,3,2,1,2,1]`,
            expectedOutput: `6`,
            isSample: true,
            isHidden: false,
            orderIndex: 1,
            explanation: `6 units of water trapped.`,
          },
          {
            input: `[4,2,0,3,2,5]`,
            expectedOutput: `9`,
            isSample: true,
            isHidden: false,
            orderIndex: 2,
            explanation: `9 units of water trapped.`,
          },
          {
            input: `[3,0,2,0,4]`,
            expectedOutput: `7`,
            isSample: false,
            isHidden: true,
            orderIndex: 3,
            explanation: `Hidden test case.`,
          },
          {
            input: `[0]`,
            expectedOutput: `0`,
            isSample: false,
            isHidden: true,
            orderIndex: 4,
            explanation: `Single element edge case.`,
          },
        ],
      },
    },
  });

  console.log(`✅ 5 Problems created:
  - 1: ${p1.title} (${p1.difficulty})
  - 2: ${p2.title} (${p2.difficulty})
  - 3: ${p3.title} (${p3.difficulty})
  - 4: ${p4.title} (${p4.difficulty})
  - 5: ${p5.title} (${p5.difficulty})
  `);

  console.log("🚀 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
