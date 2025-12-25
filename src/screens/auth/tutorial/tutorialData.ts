import { ImageSourcePropType } from 'react-native';

export interface TutorialSlide {
    id: string;
    titleKey: string;
    descriptionKey: string;
    image: ImageSourcePropType;
}

export const tutorialSlides: TutorialSlide[] = [
    {
        id: 'payment',
        titleKey: 'tutorial.slide1.title',
        descriptionKey: 'tutorial.slide1.desc',
        image: require('@assets/images/tutorial-payment.png'),
    },
    {
        id: 'map',
        titleKey: 'tutorial.slide2.title',
        descriptionKey: 'tutorial.slide2.desc',
        image: require('@assets/images/tutorial-map.png'),
    },
    {
        id: 'realtime',
        titleKey: 'tutorial.slide3.title',
        descriptionKey: 'tutorial.slide3.desc',
        image: require('@assets/images/tutorial-occupancy.png'),
    },
];
