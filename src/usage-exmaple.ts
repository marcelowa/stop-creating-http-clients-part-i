// src/usage-exmaple.ts
import { Configuration, FindPetsByStatusStatusEnum, PetApi } from './petstore3/src';

const usageExample = async () => {
  const config = new Configuration({
    basePath: 'https://petstore3.swagger.io/api/v3',
  });

  const petApi = new PetApi(config);
  const pets = await petApi.findPetsByStatus(FindPetsByStatusStatusEnum.Available);
  console.log(pets);
};

usageExample();
