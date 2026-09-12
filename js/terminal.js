/**
 * Interactive Cyberdeck Terminal (SG-CLI)
 * Authentic command parser, neofetch system info, project lookups,
 * keyboard shortcuts, and CRT glow.
 */
(function () {
  'use strict';

  var modal = document.getElementById('terminal-modal');
  var output = document.getElementById('terminal-output');
  var input = document.getElementById('terminal-input');
  var toggleBtns = document.querySelectorAll('[data-toggle-terminal]');
  var closeBtn = document.getElementById('terminal-close');

  if (!modal || !output || !input) return;

  var commandHistory = [];
  var historyIndex = -1;

  function openTerminal() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    input.focus();
    if (window.SG_SFX) window.SG_SFX.playLaunch();
    if (output.children.length === 0) {
      printWelcome();
    }
  }

  function closeTerminal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  toggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (modal.classList.contains('is-open')) {
        closeTerminal();
      } else {
        openTerminal();
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeTerminal);
  }

  // Keyboard shortcut `~` (tilde) or `Escape`
  window.addEventListener('keydown', function (e) {
    if (e.key === '`' || e.key === '~') {
      if (document.activeElement !== input && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (modal.classList.contains('is-open')) {
          closeTerminal();
        } else {
          openTerminal();
        }
      }
    } else if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeTerminal();
    }
  });

  function printLine(text, className) {
    var p = document.createElement('p');
    p.className = 'term-line ' + (className || '');
    p.innerHTML = text;
    output.appendChild(p);
    output.scrollTop = output.scrollHeight;
  }

  function printWelcome() {
    printLine('SG-OS v3.4.1 (x86_64-embedded-linux) [KERNEL: C/VERILOG/RTOS]', 'term-system');
    printLine('Type <span class="term-hl">help</span> to list commands, or <span class="term-hl">neofetch</span> for system specs.', 'term-dim');
    printLine('------------------------------------------------------------', 'term-dim');
  }

  var COMMANDS = {
    help: function () {
      printLine('<span class="term-title">AVAILABLE COMMANDS:</span>');
      printLine('  <span class="term-hl">neofetch</span>   - Display workstation hardware & engineering specs');
      printLine('  <span class="term-hl">bio</span>        - Engineer background & philosophy');
      printLine('  <span class="term-hl">skills</span>     - Silicon, firmware, and software toolset');
      printLine('  <span class="term-hl">projects</span>   - List featured hardware & software modules');
      printLine('  <span class="term-hl">resume</span>     - Transmit/download official resume (PDF)');
      printLine('  <span class="term-hl">contact</span>    - Communication frequencies (Email, GitHub, LinkedIn)');
      printLine('  <span class="term-hl">theme</span>      - Switch palette [petrol|moon|marine|retro|obsidian|light]');
      printLine('  <span class="term-hl">clear</span>      - Clear terminal screen');
      printLine('  <span class="term-hl">exit</span>       - Close terminal HUD');
    },

    neofetch: function () {
      var ascii = [
        '  <span class="term-accent">.------------------.</span>   <span class="term-bold">samarth</span><span class="term-dim">@</span><span class="term-accent">sg-workstation</span>',
        '  <span class="term-accent">|  [SG-328P]       |</span>   ---------------------',
        '  <span class="term-accent">|  IIITB // VLSI   |</span>   <span class="term-bold">OS:</span> Fedora 44 (KDE Plasma Desktop)',
        '  <span class="term-accent">|  ====  ====      |</span>   <span class="term-bold">Host:</span> Samarth Gowda (Electrical &amp; Electronics)',
        '  <span class="term-accent">|  C / SYSTEMVERILOG|</span>  <span class="term-bold">Kernel:</span> FreeRTOS / Bare-Metal C / Verilog',
        '  <span class="term-accent">|  ESP32 * STM32   |</span>   <span class="term-bold">Education:</span> IIIT Bangalore &amp; GEC Hassan',
        '  <span class="term-accent">\'------------------\'</span>   <span class="term-bold">Uptime:</span> 22 years of building machines',
        '                         <span class="term-bold">Shell:</span> SG-CLI v3.4.1 (ARM/RISC-V)',
        '                         <span class="term-bold">Creative:</span> DaVinci Resolve / KiCAD / Blender'
      ].join('\n');
      printLine('<pre class="term-ascii">' + ascii + '</pre>');
    },

    bio: function () {
      printLine('<span class="term-bold">Samarth Gowda</span> — Electrical & Electronics Engineer.');
      printLine('Specializing in VLSI design & verification, embedded firmware, and systems programming.');
      printLine('<span class="term-quote">"To truly love a machine, one must open it, understand its heart, its design &amp; its soul."</span>');
    },

    skills: function () {
      printLine('<span class="term-title">HARDWARE &amp; SOFTWARE ARCHITECTURE:</span>');
      printLine('  <span class="term-accent">[L0: SILICON]</span>   Verilog HDL, SystemVerilog, FPGA Synthesis, KiCAD, Power Electronics');
      printLine('  <span class="term-accent">[L1: EMBEDDED]</span>  ESP32, STM32, ARM Cortex-M, Arduino, FreeRTOS, I2C/SPI/UART');
      printLine('  <span class="term-accent">[L2: SYSTEMS]</span>   C, C++, Memory Management, Linux CLI, Bash');
      printLine('  <span class="term-accent">[L3: SOFTWARE]</span>  Python, Web Technologies, MATLAB / Simulink');
      printLine('  <span class="term-accent">[L4: CREATIVE]</span>  DaVinci Resolve (Video Storytelling), Blender, Visual Arts');
    },

    whoami: function () {
      printLine('<span class="term-bold">samarth</span> — Electrical &amp; Electronics Engineer (IIIT Bangalore / GEC Hassan)', 'term-accent');
    },

    date: function () {
      printLine(new Date().toUTCString(), 'term-hl');
    },

    uptime: function () {
      printLine('Uptime: 22 years, 34 projects engineered, all systems operating nominally.', 'term-dim');
    },

    projects: function (args) {
      var num = args && args[0] ? args[0] : null;
      var projectDetails = {
        '1': {
          title: 'EV Charging Station with Integrated BMS & Solar PV',
          role: 'Embedded Firmware, Solar Inverter & Battery Protection',
          desc: 'Comprehensive battery management system with real-time cell balancing, thermal runaway detection, and MPPT solar charging integration.',
          tech: 'STM32 / ESP32, C++, CAN bus, FreeRTOS, Solar PV'
        },
        '2': {
          title: 'Solar Powered Public Electric Vehicle Charging Station',
          role: 'Simulink Simulation & Power Electronics Modeling',
          desc: 'High-efficiency DC-DC buck/boost converter topologies and MATLAB/Simulink models for public EV grid balancing.',
          tech: 'MATLAB, Simulink, Power Electronics, DC-DC Converters'
        },
        '3': {
          title: 'Thermoelectric Energy Harvesting Module',
          role: 'Hardware Prototyping & Heat Flux Analysis',
          desc: 'Solid-state energy generation converting waste industrial heat into usable DC electrical energy via Seebeck effect.',
          tech: 'Peltier Modules, Boost Converters, Thermal Profiling'
        },
        '4': {
          title: 'bibliothek — Modern C++ OOP Library Engine',
          role: 'Creator & Maintainer (Open Source / GPLv3)',
          desc: 'Engineered clean polymorphic library architecture with strict memory safety, zero memory leaks, and CLI interface.',
          tech: 'Modern C++, OOP Architecture, Git, Linux'
        },
        '5': {
          title: 'Humble Beginnings in C',
          role: 'Foundational Systems Programming',
          desc: 'From first pointers to dynamic memory heaps, recursion, sorting algorithms, and bitwise manipulation.',
          tech: 'C, Pointers, Memory Allocation, GDB, Valgrind'
        },
        '6': {
          title: 'Verilog HDL Digital Logic Sandbox',
          role: 'RTL Design & Simulation',
          desc: 'Synthesizable finite state machines, ALUs, counters, and registers tested with ModelSim/Icarus testbenches.',
          tech: 'Verilog HDL, SystemVerilog, Logic Synthesis, ModelSim'
        }
      };

      if (num && projectDetails[num]) {
        var p = projectDetails[num];
        printLine('<span class="term-title">PROJECT [' + num + ']: ' + p.title + '</span>');
        printLine('  <span class="term-bold">Role:</span> ' + p.role);
        printLine('  <span class="term-bold">Description:</span> ' + p.desc);
        printLine('  <span class="term-accent">Technologies:</span> ' + p.tech);
      } else {
        printLine('<span class="term-title">FEATURED HARDWARE &amp; SOFTWARE MODULES:</span>');
        printLine('  1. <span class="term-hl">EV Charging Station + BMS</span> (Li-ion telemetry, MCU, Solar PV)');
        printLine('  2. <span class="term-hl">Solar Public Charging Station</span> (MATLAB/Simulink, DC-DC buck/boost)');
        printLine('  3. <span class="term-hl">Thermoelectric Generator</span> (Seebeck effect, Peltier modules)');
        printLine('  4. <span class="term-hl">bibliothek</span> (Modern C++ OOP Library Engine, GPLv3)');
        printLine('  5. <span class="term-hl">Humble Beginnings: C</span> (Pointers, manual memory, custom data structures)');
        printLine('  6. <span class="term-hl">Verilog HDL Sandbox</span> (Digital logic gates, ALUs, finite state machines)');
        printLine('Type <span class="term-dim">projects &lt;1-6&gt;</span> to inspect details.');
      }
    },

    resume: function () {
      printLine('Transmitting resume payload <span class="term-hl">assets/resume.pdf</span>...');
      window.open('assets/resume.pdf', '_blank');
      printLine('Resume transmission complete.', 'term-accent');
    },

    contact: function () {
      printLine('<span class="term-title">COMMUNICATION CHANNELS:</span>');
      printLine('  Email:    <a href="mailto:samarthac4work@gmail.com" class="term-link">samarthac4work@gmail.com</a>');
      printLine('  GitHub:   <a href="https://github.com/samarthhgowdaa" target="_blank" class="term-link">github.com/samarthhgowdaa</a>');
      printLine('  LinkedIn: <a href="https://www.linkedin.com/in/samarthhgowdaa/" target="_blank" class="term-link">in/samarthhgowdaa</a>');
      printLine('  RSS:      <a href="https://samarthhgowdaa.github.io/feed.xml" target="_blank" class="term-link">samarthhgowdaa.github.io/feed.xml</a>');
    },

    theme: function (args) {
      var name = (args[0] || '').toLowerCase();
      var themeMap = {
        petrol: 'petrol-teal',
        teal: 'petrol-teal',
        moon: 'moon-slate',
        slate: 'moon-slate',
        marine: 'cyber-marine',
        cyber: 'cyber-marine',
        retro: 'retro-artsy',
        artsy: 'retro-artsy',
        obsidian: 'obsidian-copper',
        copper: 'obsidian-copper',
        light: 'parchment-light',
        parchment: 'parchment-light'
      };
      if (themeMap[name]) {
        var selectedTheme = themeMap[name];
        document.documentElement.dataset.theme = selectedTheme;
        localStorage.setItem('sg_theme', selectedTheme);
        var swatches = document.querySelectorAll('.swatch-btn[data-theme-choice]');
        swatches.forEach(function (btn) {
          btn.classList.toggle('is-active', btn.dataset.themeChoice === selectedTheme);
        });
        printLine('Switched active palette to <span class="term-hl">' + selectedTheme + '</span>', 'term-accent');
      } else {
        printLine('Usage: theme [petrol | moon | marine | retro | obsidian | light]', 'term-dim');
      }
    },

    clear: function () {
      output.innerHTML = '';
      printWelcome();
    },

    exit: function () {
      closeTerminal();
    }
  };

  input.addEventListener('keydown', function (e) {
    if (window.SG_SFX) window.SG_SFX.playTerminalKey();

    if (e.key === 'Enter') {
      var raw = input.value.trim();
      input.value = '';
      if (!raw) return;

      printLine('<span class="term-prompt">samarth@sg-os:~$</span> ' + raw);
      commandHistory.push(raw);
      historyIndex = commandHistory.length;

      var parts = raw.split(/\s+/);
      var cmd = parts[0].toLowerCase();
      var args = parts.slice(1);

      if (COMMANDS[cmd]) {
        COMMANDS[cmd](args);
      } else {
        printLine('Command not recognized: "' + cmd + '". Type <span class="term-hl">help</span> for commands.', 'term-error');
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        input.value = commandHistory[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        input.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        input.value = '';
      }
    }
  });
})();
