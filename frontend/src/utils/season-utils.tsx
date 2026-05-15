import { Season } from "../objects/season";
import U9Div2Image from '../images/u9-div2-24-min.jpg'
import U9Div3Image from '../images/u9-div3-23-min.jpg'
import U8Div2Image from '../images/u8-div2-22-min.jpg'
import U8Div3Image from '../images/u8-div3-23-min.jpg'
import U10Image from '../images/u10.jpg'
import U9Image from '../images/u9.jpg'
import U8Image from '../images/u8.jpg'
import { AgeGroup } from "../objects/age-group";

export function GetImageToUse (season : Season) {

    switch (season.ageGroup)
    {
        case 8:
        {
                switch (season.startYear)
                {
                    case 2022:
                        return U8Div2Image;
                    
                    case 2023:
                        return U8Div3Image;
                }    
            return U8Div2Image
        }
        case 9:
        {
            switch (season.startYear)
            {
                case 2023:
                    return U9Div3Image;
                
                case 2024:
                    return U9Div2Image;
            }

        }
    }
    return U9Div2Image;
}


export function GetAgeGroupImageToUse (ageGroup : AgeGroup) {

    switch (ageGroup.age)
    {
        case 8:
            return U8Image;              
        case 9:
            return U9Image;            
        case 10:
            return U10Image;
    }
    return U9Div3Image;
}