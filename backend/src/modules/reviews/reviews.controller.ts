import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  create(@CurrentUser('id') customerId: string, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(customerId, dto);
  }

  @Public()
  @Get('product/:productId')
  forProduct(@Param('productId') productId: string) {
    return this.reviewsService.findForProduct(productId);
  }
}
