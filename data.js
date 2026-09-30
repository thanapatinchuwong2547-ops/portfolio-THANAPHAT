// Data store for Thanaphat Inchuwong Portfolio
// Auto-synced with localStorage, IndexedDB, and Supabase

const DEFAULT_PORTFOLIO_DATA = {
  profile: {
    fullName: "นายธนภัทร อินทร์ชูวงศ์",
    fullNameEn: "Thanaphat Inchuwong",
    nickname: "โอ",
    nicknameEn: "O",
    studentId: "68322110081-8",
    university: "มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น",
    universityEn: "Rajamangala University of Technology Isan, Khon Kaen Campus",
    campusShort: "มทร.อีสาน ขอนแก่น (ไทย-เยอรมัน)",
    faculty: "คณะครุศาสตร์อุตสาหกรรม",
    facultyEn: "Faculty of Industrial Education",
    department: "สาขาครุศาสตร์อุตสาหกรรมไฟฟ้า",
    departmentEn: "Department of Electrical Industrial Education",
    degree: "ครุศาสตร์อุตสาหกรรมบัณฑิต (ค.อ.บ.)",
    phone: "0648430351",
    email: "thanapatinchuwong2547@gmail.com",
    birthDate: "10 พฤษภาคม 2547",
    birthDateIso: "2004-05-10",
    nationality: "ไทย",
    race: "ไทย",
    religion: "พุทธ",
    specialSkills: "เล่นดนตรี (กีต้าร์, เบส), ออกแบบระบบควบคุมไฟฟ้าอุตสาหกรรม, การเขียนโปรแกรม PLC",
    avatarUrl: "assets/profile.jpg",
    heroTitle: "WELCOME TO PORTFOLIO",
    heroWhiteTitle: "THANAPHAT INCHUWONG",
    heroSubtitle: "มุ่งมั่นพัฒนาวิชาชีพครูช่างอุตสาหกรรม ผสานศาสตร์วิศวกรรมไฟฟ้าสมัยใหม่และนวัตกรรมการจัดการเรียนรู้เชิงปฏิบัติการ",
    bioStatement: "นักศึกษาหลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต สาขาวิชาครุศาสตร์อุตสาหกรรมไฟฟ้า มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น มีความมุ่งมั่นในการเรียนรู้ทั้งด้านวิศวกรรมไฟฟ้าเชิงปฏิบัติการ ระบบควบคุมอัตโนมัติในโรงงาน และศาสตร์การถ่ายทอดองค์ความรู้เพื่อผลิตบุคลากรช่างเทคนิคที่มีคุณภาพสู่ภาคอุตสาหกรรม",
    paneOrder: ["bio", "skills", "music"],
    socials: {
      github: "https://github.com/thanapatinchuwong2547-ops",
      email: "mailto:thanapatinchuwong2547@gmail.com",
      phone: "tel:0648430351",
      line: ""
    }
  },

  dashboard: {
    panel1: {
      title: "SYSTEM HIGHLIGHTS",
      code: "[SPEC_01]",
      specs: [
        {
          title: "INDUSTRIAL AUTOMATION & PLC",
          content: "เชี่ยวชาญการเขียนโปรแกรมควบคุม PLC (Siemens / Omron), Relay Ladder Logic, การเชื่อมต่อระบบนิวแมติกส์และเซนเซอร์ตรวจจับอัตโนมัติ"
        },
        {
          title: "POWER SYSTEM & ESTIMATION",
          content: "การออกแบบระบบไฟฟ้าโรงงานอุตสาหกรรม การคำนวณโหลด หม้อแปลงไฟฟ้า ระบบกราวด์ และการเขียนแบบแปลน Single Line Diagram ตามมาตรฐาน วสท./IEC"
        },
        {
          title: "VOCATIONAL PEDAGOGY",
          content: "การวิเคราะห์หลักสูตรช่างเทคนิค การออกแบบแผนการจัดการเรียนรู้ 4 ขั้นตอน (Four-Step Method) และการสร้างชุดฝึกปฏิบัติการไฟฟ้าเพื่อความปลอดภัย"
        },
        {
          title: "EMBEDDED & MOTOR DRIVE",
          content: "การควบคุมมอเตอร์ไฟฟ้ากระแสสลับ อินเวอร์เตอร์ VFD และการประยุกต์ใช้งานไมโครคอนโทรลเลอร์ IoT สำหรับมอนิเตอร์พลังงานไฟฟ้า"
        }
      ]
    },
    panel2: {
      title: "IN THE FIELD",
      code: "[FEED_02]",
      imageUrl: "assets/activity_plc.jpg",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      captionTag: "LAB WORKSHOP:",
      captionText: "ปฏิบัติการติดตั้งระบบควบคุมมอเตอร์ไฟฟ้าและตรวจวัดคุณภาพสัญญาณไฟฟ้า ณ มทร.อีสาน ขอนแก่น"
    },
    panel3: {
      title: "FIELD NOTES",
      code: "[LOGS_03]",
      notes: [
        {
          text: "การทดสอบระบบควบคุมสายพานคัดแยกวัสดุด้วย PLC S7-1200 และ HMI หน้าจอทัชสกรีน",
          index: "INDEX 03:12",
          link: "courses.html"
        },
        {
          text: "การลงพื้นที่บริการวิชาชาชีพ ตรวจเช็กระบบไฟฟ้าและตู้ MDB ชุมชนชนบท ขอนแก่น",
          index: "INDEX 02:48",
          link: "activities.html"
        },
        {
          text: "การออกแบบบทเรียนสื่อผสมสำหรับการสอนวิชาเครื่องมือวัดทางไฟฟ้าสำหรับนักศึกษาช่าง",
          index: "INDEX 01:15",
          link: "courses.html"
        }
      ]
    },
    panel4: {
      title: "SYSTEM OVERVIEW",
      code: "[CAD_04]",
      mode: "canvas",
      imageUrl: "",
      badgeLeft: "SLD: 400V/230V 50Hz",
      badgeRight: "DWG: SCHEMATIC_REV2"
    }
  },

  quickCards: [
    {
      id: "qc_01",
      badge: "CORE SPEC",
      icon: "fa-bolt",
      title: "INDUSTRIAL AUTOMATION",
      metric: "PLC / VFD",
      metricLabel: "CONTROL SYSTEMS",
      description: "เชี่ยวชาญการออกแบบวงจร Relay Ladder, การโปรแกรม PLC และระบบขับเคลื่อนมอเตอร์ไฟฟ้า",
      buttonText: "สำรวจรายวิชา",
      buttonUrl: "courses.html",
      imageUrl: "",
      videoUrl: ""
    },
    {
      id: "qc_02",
      badge: "EXPERIENCE",
      icon: "fa-chalkboard-user",
      title: "VOCATIONAL PEDAGOGY",
      metric: "4-STEP",
      metricLabel: "TEACHING METHOD",
      description: "การสอนภาคปฏิบัติงานช่างไฟฟ้า เน้นความปลอดภัยตามมาตรฐาน EIT/IEC และเทคนิค Four-Step Method",
      buttonText: "ประวัติการศึกษา",
      buttonUrl: "education.html",
      imageUrl: "",
      videoUrl: ""
    },
    {
      id: "qc_03",
      badge: "PROJECT METRICS",
      icon: "fa-microchip",
      title: "FIELD & LAB WORKS",
      metric: "40+",
      metricLabel: "WORKS & CASES",
      description: "โครงงานติดตั้งระบบไฟฟ้า ตู้ควบคุม MDB และกิจกรรมจิตอาสาบริการวิชาชีพสู่ชุมชน",
      buttonText: "ชมผลงานและกิจกรรม",
      buttonUrl: "activities.html",
      imageUrl: "",
      videoUrl: ""
    }
  ],

  skills: [
    { category: "วิศวกรรมไฟฟ้า & ควบคุม (Electrical & Control)", items: [
      { name: "PLC Programming (Siemens / Omron / Mitsubishi)", level: 90 },
      { name: "Electrical Circuit & Motor Control", level: 92 },
      { name: "AutoCAD Electrical / Schematic Drafting", level: 85 },
      { name: "Industrial Power Distribution & Wiring (EIT/IEC)", level: 88 },
      { name: "Microcontroller & IoT (Arduino / ESP32)", level: 82 }
    ]},
    { category: "ครุศาสตร์และการจัดการเรียนรู้ (Pedagogy & Teaching)", items: [
      { name: "การออกแบบแผนการจัดการเรียนรู้วิชาชีพช่าง", level: 90 },
      { name: "การสร้างชุดฝึกปฏิบัติการและสื่อการสอน", level: 94 },
      { name: "การวัดและประเมินผลทักษะภาคปฏิบัติ", level: 88 },
      { name: "เทคนิคการสอนงานภาคสนามและความปลอดภัย", level: 95 }
    ]},
    { category: "ความสามารถพิเศษ & นันทนาการ (Special Talents)", items: [
      { name: "กีต้าร์โปร่ง / กีต้าร์ไฟฟ้า (Guitar)", level: 88 },
      { name: "เบสไฟฟ้า (Electric Bass)", level: 85 },
      { name: "การเรียบเรียงดนตรีและโปรแกรมเสียง", level: 80 }
    ]}
  ],

  education: [
    {
      id: "edu-5",
      level: "ระดับปริญญาตรี (กำลังศึกษา)",
      levelEn: "Bachelor of Science in Technical Education (B.S.Tech.Ed.)",
      institution: "มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น",
      faculty: "คณะครุศาสตร์อุตสาหกรรม",
      department: "สาขาครุศาสตร์อุตสาหกรรมไฟฟ้า",
      year: "2568 - ปัจจุบัน",
      gpa: "กำลังศึกษา",
      gpaValue: 4.00,
      honors: "ศึกษาต่อยอดความเป็นครูช่างเทคนิคไฟฟ้า",
      description: "เน้นการพัฒนาทักษะวิศวกรรมไฟฟ้าระดับสูง การวิเคราะห์ระบบกำลังไฟฟ้า การควบคุมอัตโนมัติ และจิตวิทยาการจัดการเรียนการสอนสายอาชีวศึกษา",
      badge: "UNDERGRADUATE"
    },
    {
      id: "edu-4",
      level: "ระดับประกาศนียบัตรวิชาชีพชั้นสูง (ปวส. อนุปริญญา)",
      levelEn: "Higher Vocational Certificate (Dip. / Assoc. Deg.)",
      institution: "วิทยาลัยเทคนิคอุดรธานี",
      department: "สาขาวิชาช่างไฟฟ้ากำลัง",
      year: "2566 - 2568",
      gpa: "3.78",
      gpaValue: 3.78,
      honors: "เกียรตินิยม / ผลการเรียนดีเด่น",
      description: "เชี่ยวชาญการติดตั้งระบบไฟฟ้าโรงงานอุตสาหกรรม ระบบสายส่ง การควบคุมมอเตอร์ไฟฟ้ากระแสสลับ และงานบำรุงรักษาหม้อแปลงไฟฟ้า",
      badge: "VOCATIONAL DIPLOMA"
    },
    {
      id: "edu-3",
      level: "ระดับประกาศนียบัตรวิชาชีพ (ปวช.)",
      levelEn: "Vocational Certificate",
      institution: "วิทยาลัยเทคนิคอุดรธานี",
      department: "สาขาวิชาช่างไฟฟ้ากำลัง",
      year: "2563 - 2566",
      gpa: "3.78",
      gpaValue: 3.78,
      honors: "ผลการเรียนยอดเยี่ยม",
      description: "ปูพื้นฐานงานช่างเทคนิค วงจรอิเล็กทรอนิกส์พื้นฐาน การเดินสายไฟในอาคาร การใช้เครื่องมือวัดทางไฟฟ้า และความปลอดภัยในการทำงาน",
      badge: "VOCATIONAL CERT"
    },
    {
      id: "edu-2",
      level: "ระดับมัธยมศึกษาตอนต้น",
      levelEn: "Junior High School",
      institution: "โรงเรียนบ้านหมากแข้ง",
      department: "แผนการเรียนทั่วไป",
      year: "2560 - 2563",
      gpa: "3.07",
      gpaValue: 3.07,
      honors: "กิจกรรมดีเด่น",
      description: "การศึกษาระดับการศึกษาขั้นพื้นฐาน ร่วมกิจกรรมดนตรีสากลและกิจกรรมเสริมทักษะวิทยาศาสตร์และเทคโนโลยี",
      badge: "SECONDARY"
    },
    {
      id: "edu-1",
      level: "ระดับประถมศึกษา",
      levelEn: "Primary School",
      institution: "โรงเรียนบ้านหมากแข้ง",
      department: "การศึกษาขั้นพื้นฐาน",
      year: "2554 - 2560",
      gpa: "3.95",
      gpaValue: 3.95,
      honors: "ผลการเรียนดีเลิศ (GPA 3.95)",
      description: "สำเร็จการศึกษาระดับประถมศึกษาด้วยผลการเรียนดีเด่น มีความประพฤติเรียบร้อยและมีส่วนร่วมในกิจกรรมสม่ำเสมอ",
      badge: "PRIMARY"
    }
  ],

  courses: [
    {
      id: "course-1",
      code: "EE-301",
      title: "การควบคุมอัตโนมัติและระบบโปรแกรมเมเบิลคอนโทรลเลอร์ (Industrial Automation & PLC)",
      category: "automation",
      categoryName: "ระบบควบคุมอัตโนมัติ",
      credits: "3 (2-3-6)",
      term: "ภาคการศึกษาที่ 1",
      description: "ศึกษาโครงสร้าง การทำงาน การต่อวงจรเซนเซอร์อุตสาหกรรม และการเขียนโปรแกรมควบคุม Ladder Diagram สำหรับ PLC ในกระบวนการผลิตอุตสาหกรรม",
      artifacts: [
        {
          name: "ชุดจำลองการคัดแยกวัสดุอัตโนมัติด้วย PLC Siemens S7-1200",
          type: "project",
          fileUrl: "",
          tags: ["PLC", "Automation", "Ladder Logic"],
          summary: "ออกแบบวงจรฮาร์ดแวร์ เขียนโปรแกรมควบคุมสายพานลำเลียงและเซนเซอร์คัดแยกโลหะ-อโลหะ พร้อม HMI ทัชสกรีน",
          attachments: [
            {
              id: "att_c1_1",
              type: "image",
              name: "ภาพวงจรควบคุมและการต่อสายไฟตู้คอนโทรล",
              url: "assets/course_plc.jpg"
            },
            {
              id: "att_c1_2",
              type: "pdf",
              name: "เอกสารแบบแปลน Ladder Diagram & Wiring Spec.pdf",
              url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            },
            {
              id: "att_c1_3",
              type: "youtube",
              name: "วิดีโอสาธิตการทำงานของสายพานคัดแยกวัสดุ",
              url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            }
          ]
        },
        {
          name: "ใบรายงานผลการทดลองการสื่อสาร Modbus RTU / TCP",
          type: "report",
          fileUrl: "",
          tags: ["SCADA", "Modbus", "Industrial IoT"],
          summary: "เอกสารรายงานการทดสอบการเชื่อมต่อสื่อสารระหว่าง PLC และคอมพิวเตอร์ควบคุมศูนย์กลาง",
          attachments: [
            {
              id: "att_c1_4",
              type: "pdf",
              name: "รายงานผลการทดลอง Modbus RTU/TCP.pdf",
              url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            }
          ]
        }
      ]
    },
    {
      id: "course-2",
      code: "EE-214",
      title: "การออกแบบระบบไฟฟ้าและการประมาณราคา (Electrical System Design & Estimation)",
      category: "power",
      categoryName: "วิศวกรรมไฟฟ้ากำลัง",
      credits: "3 (3-0-6)",
      term: "ภาคการศึกษาที่ 2",
      description: "หลักเกณฑ์การคำนวณโหลดไฟฟ้า ขนาดสาย ตัวป้องกัน วงจรย่อย หม้อแปลงไฟฟ้า และระบบสายดินตามมาตรฐาน วสท. และ IEC",
      artifacts: [
        {
          name: "แบบแปลนระบบไฟฟ้าโรงงานอุตสาหกรรมขนาดเล็ก (AutoCAD)",
          type: "cad",
          fileUrl: "",
          tags: ["AutoCAD", "Single Line Diagram", "Load Schedule"],
          summary: "เขียนแบบ Single Line Diagram, ตารางคำนวณโหลด (Load Schedule) และตำแหน่งติดตั้งตู้ MDB/DB",
          attachments: [
            {
              id: "att_c2_1",
              type: "pdf",
              name: "Single Line Diagram & Load Schedule Plan.pdf",
              url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            }
          ]
        }
      ]
    },
    {
      id: "course-3",
      code: "TED-102",
      title: "จิตวิทยาและวิธีวิทยาการจัดการเรียนรู้วิชาชีพช่าง (Vocational Pedagogy & Methodology)",
      category: "pedagogy",
      categoryName: "ครุศาสตร์อุตสาหกรรม",
      credits: "3 (2-2-5)",
      term: "ภาคการศึกษาที่ 1",
      description: "ทฤษฎีการเรียนรู้ตามแนวคิดช่างเทคนิค การวิเคราะห์งาน (Job Analysis) การจัดทำแผนการสอน 4 ขั้นตอน (Four-Step Method) และการสร้างชุดฝึกปฏิบัติการ",
      artifacts: [
        {
          name: "แผนการจัดการเรียนรู้เรื่อง วงจรควบคุมมอเตอร์ไฟฟ้า 3 เฟสแบบกลับทางหมุน",
          type: "lesson_plan",
          fileUrl: "",
          tags: ["Lesson Plan", "Teaching 4 Steps", "Evaluation Sheet"],
          summary: "เอกสารแผนการสอนสำหรับนักศึกษา ปวช./ปวส. พร้อมใบงาน ใบความรู้ และเกณฑ์การประเมินทักษะปฏิบัติ"
        },
        {
          name: "ชุดทดลองฝึกต่อวงจร Magnetic Contactor ขนาดพกพา",
          type: "hardware",
          fileUrl: "",
          tags: ["Instructional Media", "Safety Interlock", "Wiring Trainer"],
          summary: "สื่อการสอนนวัตกรรมชุดฝึกต่อสายแบบเสียบเร็ว เพื่อความปลอดภัยในการฝึกปฏิบัติของนักศึกษา"
        }
      ]
    },
    {
      id: "course-4",
      code: "EE-110",
      title: "การวิเคราะห์วงจรไฟฟ้ากระแสตรงและกระแสสลับ (Circuit Analysis I & II)",
      category: "circuit",
      categoryName: "ทฤษฎีวงจรไฟฟ้า",
      credits: "3 (3-0-6)",
      term: "ภาคการศึกษาที่ 1",
      description: "กฎของเคอร์ชฮอฟฟ์ ทฤษฎีเทเวนิน นอร์ตัน โนดอล เมช การวิเคราะห์วงจร RLC ในสภาวะคงตัวแบบไซน์และค่ากำลังไฟฟ้า 3 เฟส",
      artifacts: [
        {
          name: "แบบจำลองการจำลองวงจร RLC Resonance ด้วย MATLAB / Proteus",
          type: "simulation",
          fileUrl: "",
          tags: ["MATLAB", "Proteus", "Resonance Simulation"],
          summary: "การวิเคราะห์การตอบสนองความถี่และการชดเชยค่าเพาเวอร์แฟกเตอร์ (Power Factor Correction)"
        }
      ]
    }
  ],

  activities: [
    {
      id: "act-1",
      title: "การแข่งขันเขียนโปรแกรมควบคุม PLC ระดับภาคตะวันออกเฉียงเหนือ",
      category: "competition",
      categoryName: "การแข่งขันทักษะวิชาชีพ",
      date: "มกราคม 2568",
      place: "ศูนย์แข่งขันทักษะวิชาชีพ อาชีวศึกษาภาคตะวันออกเฉียงเหนือ",
      badge: "AWARDS & HONORS",
      imageUrl: "assets/activity_plc.jpg",
      summary: "ตัวแทนสถานศึกษาเข้าร่วมการแข่งขันทักษะการควบคุมระบบอัตโนมัติด้วย PLC และระบบนิวแมติกส์ สามารถควบคุมการทำงานได้ตามเงื่อนไขอย่างถูกต้องแม่นยำ",
      certificateUrl: "",
      attachments: [
        {
          id: "att_act1_1",
          type: "image",
          name: "ภาพการต่อวงจรและเขียนโปรแกรมควบคุม PLC S7-1200",
          url: "assets/activity_plc.jpg"
        },
        {
          id: "att_act1_2",
          type: "image",
          name: "ภาพบรรยากาศการแข่งขันและการทดสอบระบบอัตโนมัติ",
          url: "assets/activity_plc.jpg"
        },
        {
          id: "att_act1_3",
          type: "pdf",
          name: "สูจิบัตรและเกียรติบัตรการแข่งขันทักษะวิชาชีพ.pdf",
          url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        },
        {
          id: "att_act1_4",
          type: "youtube",
          name: "วิดีโอสาธิตการทำงานของชุดควบคุมอัตโนมัติ",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
      ]
    },
    {
      id: "act-2",
      title: "โครงการอบรมเชิงปฏิบัติการติดตั้งระบบโซลาร์เซลล์และพลังงานหมุนเวียน",
      category: "training",
      categoryName: "การฝึกอบรมเชิงปฏิบัติการ",
      date: "ตุลาคม 2567",
      place: "มทร.อีสาน วิทยาเขตขอนแก่น",
      badge: "CERTIFICATION",
      imageUrl: "assets/activity_solar.jpg",
      summary: "เข้ารับการอบรมมาตรฐานการติดตั้ง Solar Rooftop, การคำนวณขนาด Inverter และการปฏิบัติตามมาตรฐานการไฟฟ้า MEA/PEA",
      certificateUrl: "",
      attachments: [
        {
          id: "att_act2_1",
          type: "image",
          name: "การฝึกปฏิบัติวัดค่ากำลังไฟฟ้าแผงโซลาร์เซลล์",
          url: "assets/activity_solar.jpg"
        },
        {
          id: "att_act2_2",
          type: "pdf",
          name: "คู่มือมาตรฐานการติดตั้งระบบ Solar Rooftop.pdf",
          url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        }
      ]
    },
    {
      id: "act-3",
      title: "กิจกรรมจิตอาสาพัฒนาโรงเรียนและตรวจเช็กระบบไฟฟ้าชุมชน",
      category: "community",
      categoryName: "บริการวิชาชีพสู่สังคม",
      date: "พฤศจิกายน 2567",
      place: "โรงเรียนในพื้นที่ชนบท จังหวัดขอนแก่น",
      badge: "COMMUNITY SERVICE",
      imageUrl: "assets/activity_community.jpg",
      summary: "นำทีมลงพื้นที่ปรับปรุงระบบแสงสว่าง ซ่อมบำรุงตู้ควบคุมไฟฟ้า และติดตั้งอุปกรณ์ป้องกันไฟฟ้ารั่ว (RCD) เพื่อความปลอดภัยของเด็กนักเรียน",
      certificateUrl: "",
      attachments: [
        {
          id: "att_act3_1",
          type: "image",
          name: "การตรวจเช็กและซ่อมบำรุงตู้ควบคุมไฟฟ้า",
          url: "assets/activity_community.jpg"
        }
      ]
    },
    {
      id: "act-4",
      title: "การแสดงดนตรีสากล (กีต้าร์และเบส) ในงานสถาปนามหาวิทยาลัย / งานแสดงดนตรีนักศึกษา",
      category: "music",
      categoryName: "กิจกรรมดนตรีและศิลปวัฒนธรรม",
      date: "ธันวาคม 2567",
      place: "หอประชุม มทร.อีสาน วิทยาเขตขอนแก่น",
      badge: "EXTRACURRICULAR",
      imageUrl: "assets/activity_music.jpg",
      summary: "ทำหน้าที่มือกีต้าร์และมือเบสประจำวงดนตรีนักศึกษาคณะครุศาสตร์อุตสาหกรรม สร้างความบันเทิงและเสริมสร้างความสามัคคีในสถาบัน",
      certificateUrl: "",
      attachments: [
        {
          id: "att_act4_1",
          type: "image",
          name: "ภาพการแสดงดนตรีสดบนเวที",
          url: "assets/activity_music.jpg"
        },
        {
          id: "att_act4_2",
          type: "youtube",
          name: "คลิปบันทึกการแสดงสดดนตรีสากล",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
      ]
    }
  ],

  siteSettings: {
    theme: "dark", // "dark" | "light"
    palette: "coffee", // "coffee" | "brick" | "amber" | "tangerine"
    accentColor: "#C68642", // Warm Roasted Coffee / Crema Gold
    accentName: "Espresso Roast Coffee",
    soundEnabled: true,
    scanlinesEnabled: false,
    hudBracketsEnabled: true,
    telemetrySpeed: 1000,
    supabase: {
      url: "",
      anonKey: "",
      enabled: false,
      lastSync: null
    }
  }
};

window.DEFAULT_PORTFOLIO_DATA = DEFAULT_PORTFOLIO_DATA;