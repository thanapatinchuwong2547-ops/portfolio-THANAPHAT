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
    avatarUrl: "",
    heroTitle: "ENGINEERING POWER. EDUCATING MINDS.",
    heroSubtitle: "มุ่งมั่นพัฒนาวิชาชีพครูช่างอุตสาหกรรม ผสานศาสตร์วิศวกรรมไฟฟ้าสมัยใหม่และนวัตกรรมการจัดการเรียนรู้เชิงปฏิบัติการ",
    bioStatement: "นักศึกษาหลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต สาขาวิชาครุศาสตร์อุตสาหกรรมไฟฟ้า มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น มีความมุ่งมั่นในการเรียนรู้ทั้งด้านวิศวกรรมไฟฟ้าเชิงปฏิบัติการ ระบบควบคุมอัตโนมัติในโรงงาน และศาสตร์การถ่ายทอดองค์ความรู้เพื่อผลิตบุคลากรช่างเทคนิคที่มีคุณภาพสู่ภาคอุตสาหกรรม",
    socials: {
      github: "https://github.com/thanapatinchuwong2547-ops",
      email: "mailto:thanapatinchuwong2547@gmail.com",
      phone: "tel:0648430351",
      line: ""
    }
  },

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
          summary: "ออกแบบวงจรฮาร์ดแวร์ เขียนโปรแกรมควบคุมสายพานลำเลียงและเซนเซอร์คัดแยกโลหะ-อโลหะ พร้อม HMI ทัชสกรีน"
        },
        {
          name: "ใบรายงานผลการทดลองการสื่อสาร Modbus RTU / TCP",
          type: "report",
          fileUrl: "",
          tags: ["SCADA", "Modbus", "Industrial IoT"],
          summary: "เอกสารรายงานการทดสอบการเชื่อมต่อสื่อสารระหว่าง PLC และคอมพิวเตอร์ควบคุมศูนย์กลาง"
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
          summary: "เขียนแบบ Single Line Diagram, ตารางคำนวณโหลด (Load Schedule) และตำแหน่งติดตั้งตู้ MDB/DB"
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
      imageUrl: "",
      summary: "ตัวแทนสถานศึกษาเข้าร่วมการแข่งขันทักษะการควบคุมระบบอัตโนมัติด้วย PLC และระบบนิวแมติกส์ สามารถควบคุมการทำงานได้ตามเงื่อนไขอย่างถูกต้องแม่นยำ",
      certificateUrl: ""
    },
    {
      id: "act-2",
      title: "โครงการอบรมเชิงปฏิบัติการติดตั้งระบบโซลาร์เซลล์และพลังงานหมุนเวียน",
      category: "training",
      categoryName: "การฝึกอบรมเชิงปฏิบัติการ",
      date: "ตุลาคม 2567",
      place: "มทร.อีสาน วิทยาเขตขอนแก่น",
      badge: "CERTIFICATION",
      imageUrl: "",
      summary: "เข้ารับการอบรมมาตรฐานการติดตั้ง Solar Rooftop, การคำนวณขนาด Inverter และการปฏิบัติตามมาตรฐานการไฟฟ้า MEA/PEA",
      certificateUrl: ""
    },
    {
      id: "act-3",
      title: "กิจกรรมจิตอาสาพัฒนาโรงเรียนและตรวจเช็กระบบไฟฟ้าชุมชน",
      category: "community",
      categoryName: "บริการวิชาชีพสู่สังคม",
      date: "พฤศจิกายน 2567",
      place: "โรงเรียนในพื้นที่ชนบท จังหวัดขอนแก่น",
      badge: "COMMUNITY SERVICE",
      imageUrl: "",
      summary: "นำทีมลงพื้นที่ปรับปรุงระบบแสงสว่าง ซ่อมบำรุงตู้ควบคุมไฟฟ้า และติดตั้งอุปกรณ์ป้องกันไฟฟ้ารั่ว (RCD) เพื่อความปลอดภัยของเด็กนักเรียน",
      certificateUrl: ""
    },
    {
      id: "act-4",
      title: "การแสดงดนตรีสากล (กีต้าร์และเบส) ในงานสถาปนามหาวิทยาลัย / งานแสดงดนตรีนักศึกษา",
      category: "music",
      categoryName: "กิจกรรมดนตรีและศิลปวัฒนธรรม",
      date: "ธันวาคม 2567",
      place: "หอประชุม มทร.อีสาน วิทยาเขตขอนแก่น",
      badge: "EXTRACURRICULAR",
      imageUrl: "",
      summary: "ทำหน้าที่มือกีต้าร์และมือเบสประจำวงดนตรีนักศึกษาคณะครุศาสตร์อุตสาหกรรม สร้างความบันเทิงและเสริมสร้างความสามัคคีในสถาบัน",
      certificateUrl: ""
    }
  ],

  siteSettings: {
    theme: "dark", // "dark" | "light"
    accentColor: "#E05A2B", // Default: Warm Brick Red
    accentName: "Brick Terracotta",
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