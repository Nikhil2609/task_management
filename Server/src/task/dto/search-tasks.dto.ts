import { IsString, IsNotEmpty } from 'class-validator';

export class SearchTasksDto {
  @IsString()
  @IsNotEmpty()
  searchString: string;
} 