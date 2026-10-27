/**
 * The Legendary Sandwich From Hell — C Programming Questions Dataset
 * 10 Basic to Intermediate C Programming Questions per Chapter (Hell, Alien, Ocean, Market)
 * Each comes with pre-written #include <stdio.h> and parenthesis.
 */

(function(window) {
  'use strict';

  const CHAPTER_QUESTIONS = {
    // =========================================================================
    // 1. HELL CHAPTER: BOOLEANS & CONDITIONS (INFERNAL CHEESE)
    // =========================================================================
    hell: [
      {
        id: 1,
        title: "Gate 1: Thermal Pressure Seal",
        difficulty: "Basic",
        desc: "Return 1 if temperature >= 1000 and pressure < 50; otherwise return 0.",
        functionName: "check_seal",
        boilerplate: `#include <stdio.h>

int check_seal(int temp, int pressure) {
    // Write your condition here:
    if (temp >= 1000 && pressure < 50) {
        return 1;
    } else {
        return 0;
    }
}`,
        testCases: [
          { id: 1, input: [1200, 30], expected: 1 },
          { id: 2, input: [800, 20], expected: 0 },
          { id: 3, input: [1000, 49], expected: 1 },
          { id: 4, input: [1500, 80], expected: 0 }
        ]
      },
      {
        id: 2,
        title: "Gate 2: Brimstone Calibrator",
        difficulty: "Basic",
        desc: "Classify sulfur PPM: return 3 if > 500 (Critical), 2 if between 200 and 500 inclusive, 1 if between 50 and 199 inclusive, else 0.",
        functionName: "classify_brimstone",
        boilerplate: `#include <stdio.h>

int classify_brimstone(int sulfur_ppm) {
    if (sulfur_ppm > 500) {
        return 3;
    } else if (sulfur_ppm >= 200) {
        return 2;
    } else if (sulfur_ppm >= 50) {
        return 1;
    }
    return 0;
}`,
        testCases: [
          { id: 1, input: [650], expected: 3 },
          { id: 2, input: [350], expected: 2 },
          { id: 3, input: [120], expected: 1 },
          { id: 4, input: [25], expected: 0 }
        ]
      },
      {
        id: 3,
        title: "Gate 3: Hellhound Clearance",
        difficulty: "Basic",
        desc: "Verify access: return 1 if soul_badge is between 660 and 669 inclusive AND is_corrupted is 1; otherwise return 0.",
        functionName: "verify_access",
        boilerplate: `#include <stdio.h>

int verify_access(int soul_badge, int is_corrupted) {
    if (soul_badge >= 660 && soul_badge <= 669 && is_corrupted == 1) {
        return 1;
    }
    return 0;
}`,
        testCases: [
          { id: 1, input: [666, 1], expected: 1 },
          { id: 2, input: [666, 0], expected: 0 },
          { id: 3, input: [650, 1], expected: 0 },
          { id: 4, input: [669, 1], expected: 1 }
        ]
      },
      {
        id: 4,
        title: "Gate 4: Lava Viscosity Stability",
        difficulty: "Basic",
        desc: "Return 1 if viscosity * flow_rate exceeds 100.0, else return 0.",
        functionName: "is_lava_stable",
        boilerplate: `#include <stdio.h>

int is_lava_stable(float viscosity, float flow_rate) {
    if ((viscosity * flow_rate) > 100.0) {
        return 1;
    }
    return 0;
}`,
        testCases: [
          { id: 1, input: [10.5, 12.0], expected: 1 },
          { id: 2, input: [5.0, 18.0], expected: 0 },
          { id: 3, input: [20.0, 5.1], expected: 1 }
        ]
      },
      {
        id: 5,
        title: "Gate 5: Divisibility of Gehenna",
        difficulty: "Intermediate",
        desc: "Return 1 if runic_number is divisible by BOTH 6 and 7, else return 0.",
        functionName: "check_divisibility",
        boilerplate: `#include <stdio.h>

int check_divisibility(int runic_number) {
    if (runic_number % 6 == 0 && runic_number % 7 == 0) {
        return 1;
    }
    return 0;
}`,
        testCases: [
          { id: 1, input: [42], expected: 1 },
          { id: 2, input: [84], expected: 1 },
          { id: 3, input: [14], expected: 0 },
          { id: 4, input: [36], expected: 0 }
        ]
      },
      {
        id: 6,
        title: "Gate 6: Abyssal Elevator Lock",
        difficulty: "Intermediate",
        desc: "If emergency is 1, return 1 immediately. Otherwise return 1 only if target_floor <= keycard_tier * 3, else 0.",
        functionName: "can_descend",
        boilerplate: `#include <stdio.h>

int can_descend(int floor, int keycard_tier, int emergency) {
    if (emergency == 1) return 1;
    return (floor <= keycard_tier * 3) ? 1 : 0;
}`,
        testCases: [
          { id: 1, input: [9, 3, 0], expected: 1 },
          { id: 2, input: [10, 3, 0], expected: 0 },
          { id: 3, input: [50, 1, 1], expected: 1 }
        ]
      },
      {
        id: 7,
        title: "Gate 7: Tri-State Sentinel",
        difficulty: "Intermediate",
        desc: "Return 1 if EXACTLY two of the three flags (a, b, c) are greater than 0, else return 0.",
        functionName: "sentinel_check",
        boilerplate: `#include <stdio.h>

int sentinel_check(int a, int b, int c) {
    int count = (a > 0) + (b > 0) + (c > 0);
    return count == 2 ? 1 : 0;
}`,
        testCases: [
          { id: 1, input: [5, 10, -2], expected: 1 },
          { id: 2, input: [1, 2, 3], expected: 0 },
          { id: 3, input: [-1, -2, -3], expected: 0 },
          { id: 4, input: [-4, 8, 12], expected: 1 }
        ]
      },
      {
        id: 8,
        title: "Gate 8: Chamber Acid Neutralizer",
        difficulty: "Intermediate",
        desc: "Return 1 if the absolute difference between acid_val and base_val is less than or equal to 5, else 0.",
        functionName: "neutralize_chamber",
        boilerplate: `#include <stdio.h>

int neutralize_chamber(int acid_val, int base_val) {
    int diff = acid_val - base_val;
    if (diff < 0) diff = -diff;
    return (diff <= 5) ? 1 : 0;
}`,
        testCases: [
          { id: 1, input: [20, 24], expected: 1 },
          { id: 2, input: [30, 20], expected: 0 },
          { id: 3, input: [15, 15], expected: 1 },
          { id: 4, input: [10, 16], expected: 0 }
        ]
      },
      {
        id: 9,
        title: "Gate 9: Magma Core Meltdown Alarm",
        difficulty: "Intermediate",
        desc: "If core_online is 0, return 0. If temp > 1500 return 2 (MELTDOWN); if temp > 1200 return 1 (WARNING); else return 0 (SAFE).",
        functionName: "core_alert",
        boilerplate: `#include <stdio.h>

int core_alert(int temp, int core_online) {
    if (!core_online) return 0;
    if (temp > 1500) return 2;
    if (temp > 1200) return 1;
    return 0;
}`,
        testCases: [
          { id: 1, input: [1600, 1], expected: 2 },
          { id: 2, input: [1300, 1], expected: 1 },
          { id: 3, input: [1800, 0], expected: 0 },
          { id: 4, input: [900, 1], expected: 0 }
        ]
      },
      {
        id: 10,
        title: "Gate 10: The Master Rune of Gehenna",
        difficulty: "Intermediate",
        desc: "Return 1 if a + b + c == 666 AND a < b AND b < c; otherwise return 0.",
        functionName: "master_rune",
        boilerplate: `#include <stdio.h>

int master_rune(int a, int b, int c) {
    if ((a + b + c == 666) && (a < b) && (b < c)) {
        return 1;
    }
    return 0;
}`,
        testCases: [
          { id: 1, input: [100, 200, 366], expected: 1 },
          { id: 2, input: [222, 222, 222], expected: 0 },
          { id: 3, input: [50, 300, 316], expected: 1 },
          { id: 4, input: [300, 200, 166], expected: 0 }
        ]
      }
    ],

    // =========================================================================
    // 2. ALIEN CHAPTER: LOOPS & LIST FILTERING (COSMIC VEGETABLES)
    // =========================================================================
    alien: [
      {
        id: 1,
        title: "Conveyor 1: Count Infected Spores",
        difficulty: "Basic",
        desc: "Iterate through the array of pods (length n) and return how many pods have spore count > 50.",
        functionName: "count_infected_spores",
        boilerplate: `#include <stdio.h>

int count_infected_spores(int pods[], int n) {
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (pods[i] > 50) {
            count++;
        }
    }
    return count;
}`,
        testCases: [
          { id: 1, input: [[20, 60, 45, 80, 10], 5], expected: 2 },
          { id: 2, input: [[10, 20, 30], 3], expected: 0 },
          { id: 3, input: [[55, 65, 75, 85], 4], expected: 4 }
        ]
      },
      {
        id: 2,
        title: "Conveyor 2: Peak Toxin Level",
        difficulty: "Basic",
        desc: "Scan array toxins (length n) and return the maximum toxin value found.",
        functionName: "max_toxin_level",
        boilerplate: `#include <stdio.h>

int max_toxin_level(int toxins[], int n) {
    int max_val = toxins[0];
    for (int i = 1; i < n; i++) {
        if (toxins[i] > max_val) {
            max_val = toxins[i];
        }
    }
    return max_val;
}`,
        testCases: [
          { id: 1, input: [[12, 45, 89, 23, 67], 5], expected: 89 },
          { id: 2, input: [[-5, -1, -10], 3], expected: -1 },
          { id: 3, input: [[100], 1], expected: 100 }
        ]
      },
      {
        id: 3,
        title: "Conveyor 3: Positive Harvest Yield",
        difficulty: "Basic",
        desc: "Sum all strictly positive harvest values in yields (length n), ignoring negative or zero values.",
        functionName: "calculate_total_yield",
        boilerplate: `#include <stdio.h>

int calculate_total_yield(int yields[], int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        if (yields[i] > 0) {
            total += yields[i];
        }
    }
    return total;
}`,
        testCases: [
          { id: 1, input: [[10, -5, 20, 0, 15], 5], expected: 45 },
          { id: 2, input: [[-1, -2, -3], 3], expected: 0 },
          { id: 3, input: [[5, 5, 5], 3], expected: 15 }
        ]
      },
      {
        id: 4,
        title: "Conveyor 4: Genetic Palindrome",
        difficulty: "Intermediate",
        desc: "Check if the genetic array reads the exact same forward and backward. Return 1 if true, else 0.",
        functionName: "is_genetic_palindrome",
        boilerplate: `#include <stdio.h>

int is_genetic_palindrome(int gene[], int n) {
    for (int i = 0; i < n / 2; i++) {
        if (gene[i] != gene[n - 1 - i]) {
            return 0;
        }
    }
    return 1;
}`,
        testCases: [
          { id: 1, input: [[1, 2, 3, 2, 1], 5], expected: 1 },
          { id: 2, input: [[1, 2, 3, 4], 4], expected: 0 },
          { id: 3, input: [[7, 7], 2], expected: 1 },
          { id: 4, input: [[9], 1], expected: 1 }
        ]
      },
      {
        id: 5,
        title: "Conveyor 5: Odd Mutations Count",
        difficulty: "Basic",
        desc: "Count and return how many numbers in mutations[] are odd.",
        functionName: "count_odd_mutations",
        boilerplate: `#include <stdio.h>

int count_odd_mutations(int mutations[], int n) {
    int odds = 0;
    for (int i = 0; i < n; i++) {
        if (mutations[i] % 2 != 0) {
            odds++;
        }
    }
    return odds;
}`,
        testCases: [
          { id: 1, input: [[1, 2, 3, 4, 5, 6, 7], 7], expected: 4 },
          { id: 2, input: [[2, 4, 6, 8], 4], expected: 0 }
        ]
      },
      {
        id: 6,
        title: "Conveyor 6: Linear Specimen Scanner",
        difficulty: "Basic",
        desc: "Find target_id in specimens[]. Return its first 0-based index, or -1 if not found.",
        functionName: "find_specimen_index",
        boilerplate: `#include <stdio.h>

int find_specimen_index(int specimens[], int n, int target_id) {
    for (int i = 0; i < n; i++) {
        if (specimens[i] == target_id) {
            return i;
        }
    }
    return -1;
}`,
        testCases: [
          { id: 1, input: [[104, 202, 305, 410], 4, 305], expected: 2 },
          { id: 2, input: [[10, 20, 30], 3, 999], expected: -1 }
        ]
      },
      {
        id: 7,
        title: "Conveyor 7: Average Moisture",
        difficulty: "Intermediate",
        desc: "Compute the average moisture reading as a float. Assume n > 0.",
        functionName: "average_moisture",
        boilerplate: `#include <stdio.h>

float average_moisture(int readings[], int n) {
    float sum = 0;
    for (int i = 0; i < n; i++) {
        sum += readings[i];
    }
    return sum / n;
}`,
        testCases: [
          { id: 1, input: [[10, 20, 30, 40], 4], expected: 25.0 },
          { id: 2, input: [[10, 15], 2], expected: 12.5 }
        ]
      },
      {
        id: 8,
        title: "Conveyor 8: Safe Range Scanner",
        difficulty: "Basic",
        desc: "Count how many elements in data[] lie between min_val and max_val inclusive.",
        functionName: "count_in_safe_range",
        boilerplate: `#include <stdio.h>

int count_in_safe_range(int data[], int n, int min_val, int max_val) {
    int safe = 0;
    for (int i = 0; i < n; i++) {
        if (data[i] >= min_val && data[i] <= max_val) {
            safe++;
        }
    }
    return safe;
}`,
        testCases: [
          { id: 1, input: [[5, 12, 18, 25, 30], 5, 10, 25], expected: 3 },
          { id: 2, input: [[1, 2, 3], 3, 10, 20], expected: 0 }
        ]
      },
      {
        id: 9,
        title: "Conveyor 9: Consecutive Bio-Spikes",
        difficulty: "Intermediate",
        desc: "Return 1 if any two adjacent elements both exceed 100, otherwise return 0.",
        functionName: "has_consecutive_spikes",
        boilerplate: `#include <stdio.h>

int has_consecutive_spikes(int readings[], int n) {
    for (int i = 0; i < n - 1; i++) {
        if (readings[i] > 100 && readings[i + 1] > 100) {
            return 1;
        }
    }
    return 0;
}`,
        testCases: [
          { id: 1, input: [[50, 120, 140, 80], 4], expected: 1 },
          { id: 2, input: [[150, 80, 150, 80], 4], expected: 0 }
        ]
      },
      {
        id: 10,
        title: "Conveyor 10: In-Place Sequence Reversal",
        difficulty: "Intermediate",
        desc: "Reverse the botanical sequence in-place.",
        functionName: "reverse_botanical_seq",
        boilerplate: `#include <stdio.h>

void reverse_botanical_seq(int arr[], int n) {
    for (int i = 0; i < n / 2; i++) {
        int temp = arr[i];
        arr[i] = arr[n - 1 - i];
        arr[n - 1 - i] = temp;
    }
}`,
        testCases: [
          { id: 1, input: [[1, 2, 3, 4, 5], 5], expectedArray: [5, 4, 3, 2, 1] },
          { id: 2, input: [[10, 20], 2], expectedArray: [20, 10] }
        ]
      }
    ],

    // =========================================================================
    // 3. OCEAN CHAPTER: FUNCTIONS & RECURSION (ABYSSAL SAUCE)
    // =========================================================================
    ocean: [
      {
        id: 1,
        title: "Trench 1: Recursive Power Generator",
        difficulty: "Basic",
        desc: "Calculate base^exp recursively. Assume exp >= 0.",
        functionName: "power",
        boilerplate: `#include <stdio.h>

int power(int base, int exp) {
    if (exp == 0) return 1;
    return base * power(base, exp - 1);
}`,
        testCases: [
          { id: 1, input: [2, 5], expected: 32 },
          { id: 2, input: [3, 3], expected: 27 },
          { id: 3, input: [7, 0], expected: 1 }
        ]
      },
      {
        id: 2,
        title: "Trench 2: Depth Factorial",
        difficulty: "Basic",
        desc: "Compute factorial(n) recursively. For n <= 1, return 1.",
        functionName: "factorial",
        boilerplate: `#include <stdio.h>

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}`,
        testCases: [
          { id: 1, input: [5], expected: 120 },
          { id: 2, input: [1], expected: 1 },
          { id: 3, input: [6], expected: 720 }
        ]
      },
      {
        id: 3,
        title: "Trench 3: Vowel Rune Counter",
        difficulty: "Basic",
        desc: "Count and return the total number of vowels (a, e, i, o, u, case-insensitive) in str.",
        functionName: "count_vowels",
        boilerplate: `#include <stdio.h>

int count_vowels(const char* str) {
    int count = 0;
    for (int i = 0; str[i] != '\\0'; i++) {
        char c = str[i];
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u' ||
            c == 'A' || c == 'E' || c == 'I' || c == 'O' || c == 'U') {
            count++;
        }
    }
    return count;
}`,
        testCases: [
          { id: 1, input: ["abyssal"], expected: 2 },
          { id: 2, input: ["MARIANA"], expected: 4 },
          { id: 3, input: ["rhythm"], expected: 0 }
        ]
      },
      {
        id: 4,
        title: "Trench 4: Custom String Length",
        difficulty: "Basic",
        desc: "Calculate string length without using strlen library function.",
        functionName: "string_length",
        boilerplate: `#include <stdio.h>

int string_length(const char* s) {
    int len = 0;
    while (s[len] != '\\0') {
        len++;
    }
    return len;
}`,
        testCases: [
          { id: 1, input: ["hello"], expected: 5 },
          { id: 2, input: ["sauce"], expected: 5 },
          { id: 3, input: [""], expected: 0 }
        ]
      },
      {
        id: 5,
        title: "Trench 5: Recursive Fibonacci Depth",
        difficulty: "Intermediate",
        desc: "Return the n-th Fibonacci number recursively (fib(0)=0, fib(1)=1, fib(2)=1).",
        functionName: "fibonacci",
        boilerplate: `#include <stdio.h>

int fibonacci(int n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`,
        testCases: [
          { id: 1, input: [6], expected: 8 },
          { id: 2, input: [8], expected: 21 },
          { id: 3, input: [0], expected: 0 }
        ]
      },
      {
        id: 6,
        title: "Trench 6: Character Frequency Scanner",
        difficulty: "Basic",
        desc: "Return the count of times character target appears in string s.",
        functionName: "char_frequency",
        boilerplate: `#include <stdio.h>

int char_frequency(const char* s, char target) {
    int count = 0;
    for (int i = 0; s[i] != '\\0'; i++) {
        if (s[i] == target) count++;
    }
    return count;
}`,
        testCases: [
          { id: 1, input: ["barracuda", "a"], expected: 3 },
          { id: 2, input: ["ocean", "z"], expected: 0 }
        ]
      },
      {
        id: 7,
        title: "Trench 7: Recursive Sum of Digits",
        difficulty: "Intermediate",
        desc: "Return the sum of digits of a non-negative integer n using recursion.",
        functionName: "sum_of_digits",
        boilerplate: `#include <stdio.h>

int sum_of_digits(int n) {
    if (n == 0) return 0;
    return (n % 10) + sum_of_digits(n / 10);
}`,
        testCases: [
          { id: 1, input: [1234], expected: 10 },
          { id: 2, input: [505], expected: 10 },
          { id: 3, input: [9], expected: 9 }
        ]
      },
      {
        id: 8,
        title: "Trench 8: Recursive GCD",
        difficulty: "Intermediate",
        desc: "Compute the Greatest Common Divisor using Euclid's recursive algorithm.",
        functionName: "gcd",
        boilerplate: `#include <stdio.h>

int gcd(int a, int b) {
    if (b == 0) return a;
    return gcd(b, a % b);
}`,
        testCases: [
          { id: 1, input: [48, 18], expected: 6 },
          { id: 2, input: [100, 25], expected: 25 },
          { id: 3, input: [17, 13], expected: 1 }
        ]
      },
      {
        id: 9,
        title: "Trench 9: Palindrome String Verifier",
        difficulty: "Intermediate",
        desc: "Return 1 if str is a palindrome (reads same forward and backward), else return 0.",
        functionName: "is_palindrome_string",
        boilerplate: `#include <stdio.h>

int is_palindrome_string(const char* str) {
    int len = 0;
    while (str[len] != '\\0') len++;
    for (int i = 0; i < len / 2; i++) {
        if (str[i] != str[len - 1 - i]) return 0;
    }
    return 1;
}`,
        testCases: [
          { id: 1, input: ["racecar"], expected: 1 },
          { id: 2, input: ["trench"], expected: 0 },
          { id: 3, input: ["level"], expected: 1 }
        ]
      },
      {
        id: 10,
        title: "Trench 10: Recursive Array Sum",
        difficulty: "Intermediate",
        desc: "Compute the sum of array elements recursively.",
        functionName: "recursive_array_sum",
        boilerplate: `#include <stdio.h>

int recursive_array_sum(int arr[], int n) {
    if (n <= 0) return 0;
    return arr[n - 1] + recursive_array_sum(arr, n - 1);
}`,
        testCases: [
          { id: 1, input: [[1, 2, 3, 4, 5], 5], expected: 15 },
          { id: 2, input: [[100, 200], 2], expected: 300 }
        ]
      }
    ],

    // =========================================================================
    // 4. MARKET CHAPTER: STRINGS & ARRAYS (ELDRITCH BREAD)
    // =========================================================================
    market: [
      {
        id: 1,
        title: "Stall 1: Sort Vendor Ledger",
        difficulty: "Intermediate",
        desc: "Sort the array of barter prices in ascending order in-place using bubble sort.",
        functionName: "sort_prices",
        boilerplate: `#include <stdio.h>

void sort_prices(int prices[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (prices[j] > prices[j + 1]) {
                int temp = prices[j];
                prices[j] = prices[j + 1];
                prices[j + 1] = temp;
            }
        }
    }
}`,
        testCases: [
          { id: 1, input: [[64, 34, 25, 12, 22], 5], expectedArray: [12, 22, 25, 34, 64] },
          { id: 2, input: [[5, 1, 4], 3], expectedArray: [1, 4, 5] }
        ]
      },
      {
        id: 2,
        title: "Stall 2: Count Unique Runes",
        difficulty: "Intermediate",
        desc: "Count and return how many unique characters exist in string str.",
        functionName: "count_unique_chars",
        boilerplate: `#include <stdio.h>

int count_unique_chars(const char* str) {
    int count = 0;
    for (int i = 0; str[i] != '\\0'; i++) {
        int is_first = 1;
        for (int j = 0; j < i; j++) {
            if (str[i] == str[j]) {
                is_first = 0;
                break;
            }
        }
        if (is_first) count++;
    }
    return count;
}`,
        testCases: [
          { id: 1, input: ["banana"], expected: 3 },
          { id: 2, input: ["alchemy"], expected: 7 }
        ]
      },
      {
        id: 3,
        title: "Stall 3: Soul to Gold Currency Converter",
        difficulty: "Basic",
        desc: "Calculate net gold: (souls * exchange_rate) - fee. If result is negative, return 0.",
        functionName: "convert_souls_to_gold",
        boilerplate: `#include <stdio.h>

int convert_souls_to_gold(int souls, int exchange_rate, int fee) {
    int total = (souls * exchange_rate) - fee;
    return total > 0 ? total : 0;
}`,
        testCases: [
          { id: 1, input: [100, 5, 20], expected: 480 },
          { id: 2, input: [2, 5, 20], expected: 0 }
        ]
      },
      {
        id: 4,
        title: "Stall 4: Array Shift Left",
        difficulty: "Basic",
        desc: "Shift array elements left by 1 position in-place, moving the first element to the end.",
        functionName: "rotate_left_by_one",
        boilerplate: `#include <stdio.h>

void rotate_left_by_one(int arr[], int n) {
    if (n <= 1) return;
    int first = arr[0];
    for (int i = 0; i < n - 1; i++) {
        arr[i] = arr[i + 1];
    }
    arr[n - 1] = first;
}`,
        testCases: [
          { id: 1, input: [[1, 2, 3, 4], 4], expectedArray: [2, 3, 4, 1] },
          { id: 2, input: [[9, 5], 2], expectedArray: [5, 9] }
        ]
      },
      {
        id: 5,
        title: "Stall 5: Second Highest Offer",
        difficulty: "Intermediate",
        desc: "Find and return the second highest integer in array offers (length n). Assume at least two distinct values.",
        functionName: "second_highest_offer",
        boilerplate: `#include <stdio.h>

int second_highest_offer(int offers[], int n) {
    int max1 = -999999, max2 = -999999;
    for (int i = 0; i < n; i++) {
        if (offers[i] > max1) {
            max2 = max1;
            max1 = offers[i];
        } else if (offers[i] > max2 && offers[i] != max1) {
            max2 = offers[i];
        }
    }
    return max2;
}`,
        testCases: [
          { id: 1, input: [[10, 40, 30, 20], 4], expected: 30 },
          { id: 2, input: [[5, 5, 4, 1], 4], expected: 4 }
        ]
      },
      {
        id: 6,
        title: "Stall 6: Count Ledger Words",
        difficulty: "Intermediate",
        desc: "Count how many words exist in string str separated by single or multiple spaces.",
        functionName: "count_words",
        boilerplate: `#include <stdio.h>

int count_words(const char* str) {
    int count = 0;
    int in_word = 0;
    for (int i = 0; str[i] != '\\0'; i++) {
        if (str[i] != ' ') {
            if (!in_word) {
                count++;
                in_word = 1;
            }
        } else {
            in_word = 0;
        }
    }
    return count;
}`,
        testCases: [
          { id: 1, input: ["eldritch bread"], expected: 2 },
          { id: 2, input: ["black void sourdough loaf"], expected: 4 },
          { id: 3, input: ["goblin"], expected: 1 }
        ]
      },
      {
        id: 7,
        title: "Stall 7: Find Duplicate in Inventory",
        difficulty: "Basic",
        desc: "Return 1 if array contains any duplicate values, else 0.",
        functionName: "has_duplicate",
        boilerplate: `#include <stdio.h>

int has_duplicate(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (arr[i] == arr[j]) return 1;
        }
    }
    return 0;
}`,
        testCases: [
          { id: 1, input: [[1, 2, 3, 2], 4], expected: 1 },
          { id: 2, input: [[10, 20, 30], 3], expected: 0 }
        ]
      },
      {
        id: 8,
        title: "Stall 8: String Anagram Check",
        difficulty: "Intermediate",
        desc: "Return 1 if s1 and s2 are anagrams (same characters in any order), else 0.",
        functionName: "are_anagrams",
        boilerplate: `#include <stdio.h>

int are_anagrams(const char* s1, const char* s2) {
    int len1 = 0, len2 = 0;
    while (s1[len1] != '\\0') len1++;
    while (s2[len2] != '\\0') len2++;
    if (len1 != len2) return 0;
    for (int i = 0; i < len1; i++) {
        int c1 = 0, c2 = 0;
        for (int j = 0; j < len1; j++) {
            if (s1[j] == s1[i]) c1++;
            if (s2[j] == s1[i]) c2++;
        }
        if (c1 != c2) return 0;
    }
    return 1;
}`,
        testCases: [
          { id: 1, input: ["listen", "silent"], expected: 1 },
          { id: 2, input: ["bread", "dough"], expected: 0 },
          { id: 3, input: ["evil", "vile"], expected: 1 }
        ]
      },
      {
        id: 9,
        title: "Stall 9: Array Equilibrium Index",
        difficulty: "Intermediate",
        desc: "Find index i such that sum of elements before i equals sum of elements after i. Return first valid index or -1.",
        functionName: "find_equilibrium_index",
        boilerplate: `#include <stdio.h>

int find_equilibrium_index(int arr[], int n) {
    int total_sum = 0;
    for (int i = 0; i < n; i++) total_sum += arr[i];
    int left_sum = 0;
    for (int i = 0; i < n; i++) {
        if (left_sum == total_sum - left_sum - arr[i]) {
            return i;
        }
        left_sum += arr[i];
    }
    return -1;
}`,
        testCases: [
          { id: 1, input: [[-7, 1, 5, 2, -4, 3, 0], 7], expected: 3 },
          { id: 2, input: [[1, 2, 3], 3], expected: -1 }
        ]
      },
      {
        id: 10,
        title: "Stall 10: Matrix Diagonal Sum",
        difficulty: "Intermediate",
        desc: "Calculate sum of main diagonal elements in a 3x3 array (flattened 9 ints).",
        functionName: "diagonal_sum_3x3",
        boilerplate: `#include <stdio.h>

int diagonal_sum_3x3(int m[], int n) {
    // 3x3 matrix indices: 0, 4, 8
    return m[0] + m[4] + m[8];
}`,
        testCases: [
          { id: 1, input: [[1, 2, 3, 4, 5, 6, 7, 8, 9], 9], expected: 15 },
          { id: 2, input: [[2, 0, 0, 0, 3, 0, 0, 0, 4], 9], expected: 9 }
        ]
      }
    ]
  };

  window.CHAPTER_QUESTIONS = CHAPTER_QUESTIONS;

})(typeof window !== 'undefined' ? window : this);
