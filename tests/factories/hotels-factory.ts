import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createHotel() {
    return prisma.hotel.create({
        data:{
            image:faker.image.imageUrl(),
            name:faker.company.companyName(), 
            Rooms:{
                createMany:{
                    data:[
                        {
                        capacity:faker.datatype.number({min:1, max:4, precision:1}),
                        name:faker.name.jobTitle()
                    },
                    {
                        capacity:faker.datatype.number({min:1, max:4, precision:1}),
                        name:faker.name.jobTitle()
                    }
                    ]
                }
            }
        }
    })
    
}