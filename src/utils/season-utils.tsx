import { Season } from "../objects/season";
import U9Div2Image from '../images/u9-div2-24-min.jpg'
import U9Div3Image from '../images/u9-div3-23-min.jpg'

export function GetImageToUse (season : Season) {

    switch (season.ageGroup)
    {
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