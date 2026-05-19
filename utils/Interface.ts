import { StaticImageData } from "next/image";
import { IconType } from "react-icons";

// Define the Sector interface
export interface Sector {
    id: string;
    listTitle: string
    title: string;
    subtitle?: string;
    description: string;
    roles: string[];
    whyChoose: string;
    bg: StaticImageData
}
