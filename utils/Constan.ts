import { Sector } from "./Interface";
import { FaLaptopCode, FaHeartbeat, FaCogs, FaCalculator, FaIndustry, FaUserTie, FaBullhorn, FaPalette, FaTruck, FaGraduationCap, FaBalanceScale, FaConciergeBell, FaChevronRight } from 'react-icons/fa';
import IT from "../app/assets/it.png";
import Healthcare from "../app/assets/healthcare.png";
import Engineering from "../app/assets/engineer.png";
import Finance from "../app/assets/finance.png";
import Industrial from "../app/assets/industry.png";
import Administrative from "../app/assets/admin.png";
import Sales from "../app/assets/sales.png";
import Creative from "../app/assets/design.png";
import Legal from "../app/assets/legal.png";
import Hospitality from "../app/assets/hospitality.png";
import Transport from "../app/assets/transport.png";
import Education from "../app/assets/edu.png";


export const SECTORS: Sector[] = [
    {
        id: 'it',
        listTitle: 'Information Technology (IT)',
        bg: IT,
        title: 'IT Recruitment Solutions That Power Innovation',
        subtitle: '(and Fix What You ‘Turned Off and On’ Twice)',
        description: 'At Mintex Staffing, we connect you with the tech geniuses who make your systems run smoother than your morning coffee. Contract, temp-to-perm, or direct hire — we bring you people who speak fluent code and calm chaos.',
        roles: [
            'IT Support Specialist',
            'Help Desk Technician',
            'Web Developer',
            'Software Engineer',
            'Data Analyst',
            'Network Administrator',
            'Systems Engineer',
            'Cloud Solutions Architect',
            'DevOps Engineer',
            'IT Project Manager',
            'IT Director / CTO'
        ],
        whyChoose: 'Partnering with Mintex means gaining access to a network of pre-vetted IT professionals who align with your company’s technology goals and culture. We identify talent that builds innovation from within — ensuring every hire strengthens your tech foundation.'
    },
    {
        id: 'healthcare',
        listTitle: 'Healthcare',
        title: 'Healthcare Recruitment Solutions That Care',
        bg: Healthcare,
        subtitle: '(Without Losing Their Patients… or Patience)',
        description: 'At Mintex Staffing, we connect healthcare facilities with professionals who treat people, not just paperwork. Whether you need help stat or steady support, we’ve got the right hands on deck.',
        roles: [
            'Medical Assistant',
            'Phlebotomist',
            'LPN / RN',
            'Radiology Tech',
            'Healthcare Administrator',
            'Medical Assistant',
            'Phlebotomist',
            'LPN / RN',
            'Radiology Tech',
            'Healthcare Administrator',
        ],
        whyChoose: 'We understand the importance of reliability in healthcare. Our team ensures every professional we place is skilled, compassionate, and ready to make a difference.'
    },
    {
        id: 'engineering',
        listTitle: 'Engineering',
        title: 'Engineering Recruitment Solutions That Actually Work',
        bg: Engineering,
        description: 'We get it — your projects need people who think in blueprints and dream in 3D. At Mintex Staffing, we deliver engineers who turn “it should work” into “it does.”',
        roles: [
            'Engineering Assistant',
            'CAD Technician',
            'Mechanical Engineer',
            'Process Engineer',
            'Project Engineer',
            'Manufacturing Engineer',
            'Plant Engineer',
            'Engineering Manager',
            'Director of Engineering'
        ],
        whyChoose: 'We go beyond technical expertise — matching engineers who fit your company’s culture, pace, and innovation goals.'
    },
    {
        id: 'finance',
        listTitle: 'Finance and Accounting',
        title: 'Accounting & Finance Recruitment Solutions That Make Cents',
        bg: Finance,
        description: 'At Mintex Staffing, we connect you with financial pros who can balance more than just spreadsheets including your sanity.',
        roles: [
            'Accounts Clerk',
            'Bookkeeper',
            'Junior Accountant',
            'Payroll Specialist',
            'Financial Analyst',
            'Controller',
            'Finance Manager',
            'Accounting Director',
            'CFO'
        ],
        whyChoose: 'We find finance experts who don’t just manage numbers they strengthen your company’s foundation and profitability.'
    },
    {
        id: 'industrial',
        listTitle: 'Industrial and Manufacturing',
        title: 'Manufacturing Recruitment Solutions That Keep the Line Rolling',
        bg: Industrial,
        description: 'Machines don’t run themselves (yet). That’s where we come in. At Mintex Staffing, we connect you with dependable doers who keep the gears turning and the lights on.',
        roles: [
            'Assembler',
            'Machine Operator',
            'Forklift Driver',
            'Maintenance Tech',
            'Quality Inspector',
            'CNC Machinist',
            'Production Supervisor',
            'Plant Engineer',
            'Operations Manager',
            'Plant Director'
        ],
        whyChoose: 'We understand the urgency of industrial staffing and deliver reliable, ready-to-work talent who keep your operations on schedule.'
    },
    {
        id: 'admin',
        listTitle: 'Administrative and Clerical',
        title: 'Clerical Recruitment Solutions That Actually Get Things Done',
        bg: Administrative,
        description: 'The backbone of every office? Admins who remember birthdays and budgets. At Mintex Staffing, we find detail-oriented legends who make chaos look organized.',
        roles: [
            'Receptionist',
            'Data Entry Clerk',
            'Administrative Assistant',
            'Office Coordinator',
            'Executive Assistant',
            'HR Assistant',
            'Project Coordinator',
            'Office Manager',
            'Operations Manager'
        ],
        whyChoose: 'We provide professionals who blend precision, communication, and efficiency ensuring seamless daily operations.'
    },
    {
        id: 'sales',
        listTitle: 'Sales and Marketing',
        title: 'Sales & Marketing Recruitment Solutions That Actually Sell',
        bg: Sales,
        subtitle: '(Without the Sleaze)',
        description: 'At Mintex Staffing, we connect you with salespeople who close deals, not doors and marketers who make noise the right way.',
        roles: [
            'SDR / BDR',
            'Inside Sales Rep',
            'Marketing Coordinator',
            'Account Executive',
            'Sales Engineer',
            'Customer Success Manager',
            'Regional Sales Manager',
            'Director of Sales',
            'VP of Sales'
        ],
        whyChoose: 'Partnering with Mintex means working with a team that understands your growth goals and delivers talent that turns potential into performance.'
    },
    {
        id: 'creative',
        listTitle: 'Creative and Design',
        title: 'Creative & Design Recruitment Solutions That Look Too Good to Ignore',
        bg: Creative,
        subtitle: '(and Fix What You ‘Turned Off and On’ Twice)',
        description: 'At Mintex Staffing, we connect you with the tech geniuses who make your systems run smoother than your morning coffee. Contract, temp-to-perm, or direct hire — we bring you people who speak fluent code and calm chaos.',
        roles: [
            'Graphic Designer',
            'Content Creator',
            'Copywriter',
            'UI/UX Designer',
            'Video Editor',
            'Art Director',
            'Creative Strategist',
            'Brand Manager',
            'Creative Director'
        ],
        whyChoose: 'We help you find creative professionals who think beyond trends crafting designs that define your brand identity.'
    },
    {
        id: 'transport',
        listTitle: 'Transportation and Logistics',
        title: 'Transportation & Logistics Recruitment Solutions That Deliver',
        bg: Transport,
        subtitle: '(Literally)',
        description: 'At Mintex Staffing, we move fast just like your shipments. From warehouse to delivery, we’ve got professionals who know how to keep things on track and on time.',
        roles: [
            'Warehouse Associate',
            'Forklift Operator',
            'Dispatcher',
            'Inventory Clerk',
            'Fleet Supervisor',
            'Logistics Analyst',
            'Supply Chain Manager',
            'Transportation Manager',
            'Director of Operations'
        ],
        whyChoose: 'We know logistics never stop and neither do we. Our team ensures your workforce runs on time, every time.'
    },
    {
        id: 'education',
        listTitle: 'Education',
        title: 'Education Recruitment Solutions That Make the Grade',
        bg: Education,
        subtitle: '(and Fix What You ‘Turned Off and On’ Twice)',
        description: 'At Mintex Staffing, we connect schools with teachers and leaders who spark curiosity (and survive parent-teacher meetings).',
        roles: [
            'Teaching Assistant',
            'Primary Teacher',
            'High School Teacher',
            'Academic Advisor',
            'Campus Coordinator',
            'Registrar',
            'Student Services Specialist',
            'Curriculum Coordinator',
            'Counselor',
            'Principal',
            'Education Director'
        ],
        whyChoose: 'We believe in placing educators who make an impact shaping brighter futures for every student.'
    },
    {
        id: 'legal',
        listTitle: 'Legal',
        title: 'Legal Recruitment Solutions That Stand Their Ground',
        bg: Legal,
        description: 'At Mintex Staffing, we connect firms with legal professionals who know their case law and how to keep it classy in court.',
        roles: [
            'Legal Clerk',
            'Paralegal',
            'Legal Assistant',
            'Contracts Administrator',
            'Attorney',
            'Corporate Counsel',
            'Litigation Manager',
            'General Counsel'
        ],
        whyChoose: 'We go beyond qualifications identifying legal talent that upholds integrity and advances your firm’s goals.'
    },
    {
        id: 'hospitality',
        listTitle: 'Hospitality',
        title: 'Hospitality Recruitment Solutions That Make Guests Feel Like Royalty',
        bg: Hospitality,
        description: 'At Mintex Staffing, we help you find the people who serve smiles with every plate, pour, or pillow fluff.',
        roles: [
            'Server',
            'Host/Hostess',
            'Housekeeper',
            'Bartender',
            'Front Desk Agent',
            'Event Coordinator',
            'Sous Chef',
            'Restaurant Manager',
            'Hotel General Manager'
        ],
        whyChoose: 'We deliver professionals who blend skill with warmth ensuring every interaction reflects your brand’s excellence.'
    }
];
