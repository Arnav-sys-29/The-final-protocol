/**
 * The Legendary Sandwich From Hell — Finale Boss Battle C Dataset
 * 20 Rapid-Fire Corrupted C Programs with realistic context lines.
 * Designed for high-intensity 12-second inspection and patching by the Leader.
 * No inline comments or hints in the code.
 */
(function(window) {
  'use strict';

  const BOSS_C_QUESTIONS = [
    {
      id: 1,
      title: "Core Reactor 1: Equality Check",
      desc: "Vorbulon's heat regulator uses an assignment instead of comparison!",
      corrupted: `#include <stdio.h>

int check_heat(int temp, int threshold) {
    int status = 0;
    if (temp = 1000) {
        status = 1;
    }
    return status;
}`,
      hint: "",
      validate: (code) => {
        return /temp\s*==\s*1000/.test(code) && !/temp\s*=\s*1000(?!=)/.test(code);
      }
    },
    {
      id: 2,
      title: "Void Beam 2: Missing Semicolon",
      desc: "The plasma emitter failed to terminate its instruction line!",
      corrupted: `#include <stdio.h>

void fire_beam(int power) {
    int intensity = power * 2;
    printf("Channeling brimstone energy: %d\\n", intensity)
    printf("Beam emitted successfully.\\n");
}`,
      hint: "",
      validate: (code) => {
        return /printf\("Channeling[^\n]+\)\s*;/.test(code);
      }
    },
    {
      id: 3,
      title: "Void Shield 3: Comparison & Semicolon",
      desc: "The shield logic is inverted and its return statement is missing termination!",
      corrupted: `#include <stdio.h>

int shield_active(int power, int emergency) {
    if (power < 50) {
        return 1
    }
    return emergency;
}`,
      hint: "",
      validate: (code) => {
        return /power\s*(>=|>)\s*(50|49)/.test(code) && /return\s+1\s*;/.test(code);
      }
    },
    {
      id: 4,
      title: "Pulse Array 4: Uninitialized Variable",
      desc: "Variable 'charge' has no initial value before arithmetic!",
      corrupted: `#include <stdio.h>

int get_charge(int multiplier) {
    int charge;
    int base = 5;
    return (charge + base) * multiplier;
}`,
      hint: "",
      validate: (code) => {
        return /int\s+charge\s*=\s*\d+/.test(code);
      }
    },
    {
      id: 5,
      title: "Chronos Loop 5: Decrement Loop Bug",
      desc: "The for loop decrements backwards into an infinite loop!",
      corrupted: `#include <stdio.h>

void charge_capacitors(int limit) {
    int total = 0;
    for (int i = 0; i < limit; i--) {
        total += i;
        printf("Pulse %d, total %d\\n", i, total);
    }
}`,
      hint: "",
      validate: (code) => {
        return /for\s*\([^;]+;[^;]+;\s*i\+\+\s*\)/.test(code);
      }
    },
    {
      id: 6,
      title: "Sensor HUD 6: Format String Typo",
      desc: "Printing an integer core temperature with a string %s specifier!",
      corrupted: `#include <stdio.h>

void report_temp(int sensor_id, int core_temp) {
    printf("Sensor [%d] online.\\n", sensor_id);
    printf("Core Temperature: %s\\n", core_temp);
}`,
      hint: "",
      validate: (code) => {
        return /printf\([^)]*%d[^)]*,\s*core_temp\)/.test(code) && !/%s/.test(code);
      }
    },
    {
      id: 7,
      title: "Memory Array 7: Off-By-One & Semicolon",
      desc: "Index 3 is out of bounds for a 3-cell array and assignment lacks a semicolon!",
      corrupted: `#include <stdio.h>

int read_last_cell() {
    int cells[3] = {10, 20, 30};
    int result = cells[3]
    return result;
}`,
      hint: "",
      validate: (code) => {
        return /cells\[2\]\s*;/.test(code) && !/cells\[3\]/.test(code);
      }
    },
    {
      id: 8,
      title: "Coolant Valve 8: Missing Closing Brace",
      desc: "Function scope is unclosed due to a missing curly brace!",
      corrupted: `#include <stdio.h>

int open_coolant(int pressure) {
    int valve_psi = 100;
    if (pressure > valve_psi) {
        return 1;
    }
    return 0;
`,
      hint: "",
      validate: (code) => {
        const opens = (code.match(/\{/g) || []).length;
        const closes = (code.match(/\}/g) || []).length;
        return opens > 0 && opens === closes;
      }
    },
    {
      id: 9,
      title: "Energy Conduit 9: Wrong Operator",
      desc: "Subtracting booster power instead of adding it!",
      corrupted: `#include <stdio.h>

int amplify(int base, int boost, int damping) {
    int energy = base - boost;
    return energy - damping;
}`,
      hint: "",
      validate: (code) => {
        return /base\s*\+\s*boost/.test(code);
      }
    },
    {
      id: 10,
      title: "Main Ignition 10: Missing Semicolon",
      desc: "Return statement is missing its terminating semicolon!",
      corrupted: `#include <stdio.h>

int main() {
    int engine_started = 1;
    printf("Starting engine...\\n");
    return engine_started
}`,
      hint: "",
      validate: (code) => {
        return /return\s+engine_started\s*;|return\s+0\s*;/.test(code);
      }
    },
    {
      id: 11,
      title: "Circuit Breaker 11: Inverted NOT Logic",
      desc: "Checking !ready instead of ready for system greenlight!",
      corrupted: `#include <stdio.h>

int verify_ready(int ready, int override_flag) {
    if (override_flag) return 1;
    if (!ready) {
        return 1;
    }
    return 0;
}`,
      hint: "",
      validate: (code) => {
        return /if\s*\(\s*(ready\b(?!==\s*0)|ready\s*==\s*1)\s*\)/.test(code) && !/!\s*ready/.test(code);
      }
    },
    {
      id: 12,
      title: "Rune Sigil 12: Unclosed Char Literal",
      desc: "Single quotation mark left unclosed on character literal!",
      corrupted: `#include <stdio.h>

char get_sigil(int slot) {
    char default_rune = 'A';
    char rune = 'V;
    return slot > 0 ? rune : default_rune;
}`,
      hint: "",
      validate: (code) => {
        return /'V'\s*;/.test(code);
      }
    },
    {
      id: 13,
      title: "Stabilizer 13: Compound Operand & Semicolon",
      desc: "Missing operand in compound addition and return lacks termination!",
      corrupted: `#include <stdio.h>

int recharge(int battery, int rate) {
    battery += ;
    return battery
}`,
      hint: "",
      validate: (code) => {
        return /battery\s*\+=\s*(\w+|\d+)\s*;/.test(code) && /return\s+battery\s*;/.test(code);
      }
    },
    {
      id: 14,
      title: "Ratio Calculation 14: Integer Division",
      desc: "Dividing two integer constants results in zero instead of 0.5!",
      corrupted: `#include <stdio.h>

float calculate_ratio(float scale) {
    float base_ratio = 1 / 2;
    return base_ratio * scale;
}`,
      hint: "",
      validate: (code) => {
        return /(1\.0|2\.0|0\.5)/.test(code);
      }
    },
    {
      id: 15,
      title: "Overdrive 15: Type Mismatch",
      desc: "Returning string pointer \"ACTIVE\" from function returning int!",
      corrupted: `#include <stdio.h>

int system_status(int error_count) {
    if (error_count > 0) return 0;
    return "ACTIVE";
}`,
      hint: "",
      validate: (code) => {
        return /return\s+\d+\s*;/.test(code) && !/return\s*"/.test(code);
      }
    },
    {
      id: 16,
      title: "Capacitor 16: Out of Bounds Access",
      desc: "Reading index 3 from a 3-element array! First element is cores[0].",
      corrupted: `#include <stdio.h>

int get_first_core(int bias) {
    int cores[3] = {10, 20, 30};
    int selected = cores[3];
    return selected + bias;
}`,
      hint: "",
      validate: (code) => {
        return /cores\[0\]/.test(code) && !/cores\[3\]/.test(code);
      }
    },
    {
      id: 17,
      title: "Subspace Pulse 17: Format Typo & Semicolon",
      desc: "Printf uses %s for integer frequency and lacks a semicolon!",
      corrupted: `#include <stdio.h>

void broadcast_pulse(int freq, int ch) {
    printf("Broadcasting on channel %d\\n", ch);
    printf("Pulse frequency: %s\\n", freq)
}`,
      hint: "",
      validate: (code) => {
        return /%d[^)]*,\s*freq\s*\)\s*;/.test(code) && !/%s/.test(code);
      }
    },
    {
      id: 18,
      title: "Energy Conduit 18: Pointer Dereference",
      desc: "Incrementing memory pointer address instead of target integer value!",
      corrupted: `#include <stdio.h>

void boost_shield(int *val, int max_limit) {
    if (*val < max_limit) {
        val = val + 10;
    }
}`,
      hint: "",
      validate: (code) => {
        return /\*val\s*(\+=\s*10|=\s*\*val\s*\+\s*10)/.test(code);
      }
    },
    {
      id: 19,
      title: "Containment Matrix 19: Logical Operator Error",
      desc: "Range check uses logical OR (||) instead of logical AND (&&)!",
      corrupted: `#include <stdio.h>

int is_safe(int temp, int pressure) {
    if (pressure > 200) return 0;
    if (temp > 0 || temp < 100) {
        return 1;
    }
    return 0;
}`,
      hint: "",
      validate: (code) => {
        return /temp\s*>\s*0\s*&&\s*temp\s*<\s*100/.test(code);
      }
    },
    {
      id: 20,
      title: "Omega Surge 20: Missing Return Statement",
      desc: "Calculating surge value but forgot the return keyword!",
      corrupted: `#include <stdio.h>

int compute_surge(int surge, int boost) {
    int total = surge + boost;
    total * 2;
}`,
      hint: "",
      validate: (code) => {
        return /return\s+total\s*\*\s*2\s*;|return\s+surge\s*\*\s*2\s*;/.test(code);
      }
    }
  ];

  window.BOSS_C_QUESTIONS = BOSS_C_QUESTIONS;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BOSS_C_QUESTIONS;
  }
})(typeof window !== 'undefined' ? window : global);
