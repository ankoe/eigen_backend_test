import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { UpdateBookDto } from './dto/update-book.dto';
import { HttpException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { Book } from './entities/book.entity';

describe('BooksService', () => {
  let service: BooksService;
  let repository: Repository<Book>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    repository = module.get<Repository<Book>>(getRepositoryToken(Book));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new book', async () => {
      const createBookDto: CreateBookDto = {
        code: 'JK-121',
        title: 'New Book',
        author: 'Author',
        stock: 1,
      };
      const book = { id: 1, ...createBookDto };

      mockRepository.create.mockReturnValue(book);
      mockRepository.save.mockResolvedValue(book);

      const result = await service.create(createBookDto);

      expect(repository.create).toHaveBeenCalledWith(createBookDto);
      expect(repository.save).toHaveBeenCalledWith(book);
      expect(result).toEqual(book);
    });
  });

  describe('findAll', () => {
    it('should return an array of books', async () => {
      const books = [
        {
          id: 1,
          code: 'JK-121',
          title: 'New Book',
          author: 'Author',
          stock: 1,
        },
      ];
      mockRepository.find.mockResolvedValue(books);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(books);
    });
  });

  describe('findOne', () => {
    it('should return a book by ID', async () => {
      const book = {
        code: 'JK-121',
        title: 'New Book',
        author: 'Author',
        stock: 1,
      };
      mockRepository.findOneBy.mockResolvedValue(book);

      const result = await service.findOne(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(book);
    });

    it('should throw an exception if book not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(HttpException);
      await expect(service.findOne(1)).rejects.toThrow('Book Not Found');
    });
  });

  describe('update', () => {
    it('should update and save an existing book', async () => {
      const updateBookDto: UpdateBookDto = { title: 'Updated Book' };
      const existingBook = {
        id: 1,
        code: 'JK-121',
        title: 'New Book',
        author: 'Author',
        stock: 1,
        borrows: [],
      };
      const updatedBook = { ...existingBook, ...updateBookDto };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingBook);
      mockRepository.merge.mockReturnValue(updatedBook);
      mockRepository.save.mockResolvedValue(updatedBook);

      const result = await service.update(1, updateBookDto);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repository.merge).toHaveBeenCalledWith(
        existingBook,
        updateBookDto,
      );
      expect(repository.save).toHaveBeenCalledWith(updatedBook);
      expect(result).toEqual(updatedBook);
    });
  });

  describe('remove', () => {
    it('should soft remove an existing book', async () => {
      const book = {
        id: 1,
        code: 'JK-121',
        title: 'New Book',
        author: 'Author',
        stock: 1,
        borrows: [],
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(book);
      mockRepository.softRemove.mockResolvedValue(book);

      const result = await service.remove(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repository.softRemove).toHaveBeenCalledWith(book);
      expect(result).toEqual(book);
    });
  });
});
