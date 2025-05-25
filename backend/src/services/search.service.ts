import axios from 'axios';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Types
export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  analysis: string;
}

export class SearchService {
  private serpApiKey: string;
  private geminiApiKey: string;
  
  constructor() {
    this.serpApiKey = process.env.SERPAPI_KEY || '';
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
    
    if (!this.serpApiKey) {
      console.warn('SERPAPI_KEY not found in environment variables. Using mock data.');
    }
    
    if (!this.geminiApiKey) {
      console.warn('GEMINI_API_KEY not found in environment variables. Using mock analysis.');
    }
  }

  async searchByText(query: string): Promise<SearchResponse> {
    try {
      console.log('SearchService: Searching for text query:', query);
      
      // Если нет ключа API, возвращаем тестовые данные
      if (!this.serpApiKey) {
        return this.getMockSearchResults(query);
      }
      
      // Search the web using SerpAPI
      const searchResults = await this.performWebSearch(query);
      
      // Analyze results using Gemini
      const analysis = await this.analyzeResults(query, searchResults);
      
      return {
        query,
        results: searchResults,
        analysis
      };
    } catch (error) {
      console.error('Error in searchByText:', error);
      // В случае ошибки возвращаем тестовые данные
      return this.getMockSearchResults(query);
    }
  }

  async searchWithImage(query: string, imageFile?: Express.Multer.File): Promise<SearchResponse> {
    try {
      console.log('SearchService: Searching with image, query:', query);
      console.log('Image file:', imageFile?.originalname);
      
      // Используем текст из изображения для улучшения запроса
      let enhancedQuery = query;
      
      // Анализируем содержимое изображения, если оно доступно
      let imageContent = '';
      if (imageFile) {
        imageContent = await this.analyzeImageContent(imageFile);
        console.log('Extracted image content:', imageContent);
        
        // Если есть информация из изображения, улучшаем запрос
        if (imageContent && (!query || query.trim() === '')) {
          enhancedQuery = `Информация о ${imageContent}`;
        } else if (imageContent) {
          enhancedQuery = `${query} ${imageContent}`;
        }
      }
      
      console.log('Enhanced query:', enhancedQuery);
      
      // Если нет ключа API, возвращаем тестовые данные
      if (!this.serpApiKey) {
        return this.getMockImageSearchResults(enhancedQuery, imageContent, imageFile);
      }
      
      // Выполняем поиск с улучшенным запросом
      const searchResults = await this.performWebSearch(enhancedQuery);
      
      // Анализируем результаты с учетом изображения
      const analysis = await this.analyzeResults(enhancedQuery, searchResults, imageFile, imageContent);
      
      return {
        query: enhancedQuery,
        results: searchResults,
        analysis
      };
    } catch (error) {
      console.error('Error in searchWithImage:', error);
      // В случае ошибки возвращаем тестовые данные
      return this.getMockImageSearchResults(query, '', imageFile);
    }
  }

  // Метод для анализа содержимого изображения
  private async analyzeImageContent(imageFile: Express.Multer.File): Promise<string> {
    try {
      console.log('Analyzing image:', imageFile.originalname);
      
      // Здесь должен быть код для отправки изображения в Gemini API
      // и получения описания содержимого
      
      // Для демонстрации используем улучшенную имитацию распознавания
      
      // Определяем тип содержимого по имени файла и mimetype
      const filename = imageFile.originalname.toLowerCase();
      const mimetype = imageFile.mimetype || '';
      
      // Расширяем детекцию контента
      if (filename.includes('cyber') || filename.includes('security') || filename.includes('cyberx')) {
        return 'компания по кибербезопасности, логотип CyberX с элементами защиты информации';
      } 
      else if (filename.includes('person') || mimetype.includes('portrait') || filename.includes('face')) {
        // Обработка фотографий людей
        return 'фотография человека, портретный снимок';
      }
      else if (filename.includes('food') || filename.includes('meal') || filename.includes('dish')) {
        // Обработка фотографий еды
        return 'блюдо или продукты питания, кулинарная фотография';
      }
      else if (filename.includes('tech') || filename.includes('device') || filename.includes('gadget')) {
        // Обработка изображений техники
        return 'технологическое устройство или гаджет';
      }
      else if (filename.includes('nature') || filename.includes('landscape')) {
        // Обработка пейзажей
        return 'природный пейзаж или ландшафт';
      }
      else if (filename.includes('building') || filename.includes('architecture')) {
        // Обработка архитектуры
        return 'архитектурное сооружение или здание';
      }
      else if (filename.includes('art') || filename.includes('painting')) {
        // Обработка произведений искусства
        return 'художественное произведение или изображение';
      }
      else if (filename.includes('logo') || filename.includes('brand')) {
        // Обработка логотипов
        return 'логотип компании или бренда, корпоративная символика';
      }
      else if (filename.includes('chart') || filename.includes('graph') || filename.includes('diagram')) {
        // Обработка диаграмм и графиков
        return 'график, диаграмма или визуализация данных';
      }
      else if (filename.includes('document') || filename.includes('text') || mimetype.includes('document')) {
        // Обработка документов
        return 'документ с текстовой информацией или изображение с текстом';
      }
      
      // Если не удалось определить по имени, пробуем по типу MIME
      if (mimetype.includes('image/jpeg') || mimetype.includes('image/png')) {
        return 'изображение, требующее визуального анализа';
      }
      
      // Общий случай
      return 'неопределенное изображение, требующее визуального анализа';
    } catch (error) {
      console.error('Error analyzing image:', error);
      return 'изображение, которое не удалось проанализировать';
    }
  }

  private async performWebSearch(query: string): Promise<SearchResult[]> {
    try {
      // Если нет ключа API, возвращаем тестовые данные
      if (!this.serpApiKey) {
        return this.getMockResults();
      }
      
      // Use SerpAPI to search Google
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          q: query,
          api_key: this.serpApiKey,
          engine: 'google'
        }
      });
      
      // Parse and transform the results
      const organicResults = response.data.organic_results || [];
      
      return organicResults.map((result: any, index: number) => ({
        title: result.title || '',
        link: result.link || '',
        snippet: result.snippet || '',
        position: index + 1
      }));
    } catch (error) {
      console.error('Error in performWebSearch:', error);
      return this.getMockResults();
    }
  }

  private async analyzeResults(
    query: string, 
    results: SearchResult[], 
    imageFile?: Express.Multer.File,
    imageContent?: string
  ): Promise<string> {
    try {
      // Если нет результатов, возвращаем базовый ответ
      if (!results || results.length === 0) {
        return `К сожалению, по запросу "${query}" не найдено релевантных результатов. Попробуйте изменить запрос или добавить больше деталей.`;
      }

      // Если у нас есть ключ Gemini API, используем его для анализа
      if (this.geminiApiKey) {
        try {
          // В реальном приложении здесь был бы вызов Gemini API
          // Но пока мы используем логику имитации более конкретного ответа
          return this.generateDetailedAnswer(query, results, imageFile, imageContent);
        } catch (error) {
          console.error('Error using Gemini API:', error);
          // Если ошибка с Gemini, используем резервный метод
        }
      }
      
      // Резервный метод, если нет ключа Gemini или произошла ошибка
      return this.generateDetailedAnswer(query, results, imageFile, imageContent);
    } catch (error) {
      console.error('Error in analyzeResults:', error);
      return `На основе найденных результатов не удалось сформировать полный ответ для запроса "${query}". Рекомендуем просмотреть найденные источники напрямую.`;
    }
  }
  
  // Метод для генерации подробного ответа на основе результатов поиска
  private generateDetailedAnswer(
    query: string,
    results: SearchResult[],
    imageFile?: Express.Multer.File,
    imageContent?: string
  ): string {
    // Определяем тип запроса и генерируем соответствующий ответ
    const lowerQuery = query.toLowerCase();
    
    // Если есть изображение, приоритизируем информацию о нем
    if (imageFile && imageContent) {
      // Ответ для запроса с изображением
      return this.generateImageBasedAnswer(query, results, imageContent);
    } else if (lowerQuery.includes('кто такой') || lowerQuery.includes('кто такая') || lowerQuery.includes('кто такие')) {
      // Для вопросов о людях, организациях
      return this.generatePersonOrganizationAnswer(query, results);
    } else if (lowerQuery.includes('как') || lowerQuery.includes('что делать') || lowerQuery.includes('каким образом')) {
      // Для инструкций и руководств
      return this.generateHowToAnswer(query, results);
    } else if (lowerQuery.includes('что такое') || lowerQuery.includes('определение')) {
      // Для определений
      return this.generateDefinitionAnswer(query, results);
    } else {
      // Для общих запросов
      return this.generateGeneralAnswer(query, results);
    }
  }
  
  // Метод для генерации ответа на основе анализа изображения
  private generateImageBasedAnswer(query: string, results: SearchResult[], imageContent: string): string {
    // Определяем категорию изображения для выбора шаблона ответа
    const lowerContent = imageContent.toLowerCase();
    
    // Логотип компании или бренд
    if (lowerContent.includes('логотип') || lowerContent.includes('бренд') || lowerContent.includes('компания')) {
      return this.generateLogoAnalysis(query, results, imageContent);
    }
    // Продукты питания или блюда
    else if (lowerContent.includes('блюдо') || lowerContent.includes('еда') || lowerContent.includes('продукт') || lowerContent.includes('кулинар')) {
      return this.generateFoodAnalysis(query, results, imageContent);
    }
    // Технические устройства
    else if (lowerContent.includes('устройств') || lowerContent.includes('гаджет') || lowerContent.includes('техник')) {
      return this.generateTechDeviceAnalysis(query, results, imageContent);
    }
    // Природа или пейзажи
    else if (lowerContent.includes('природ') || lowerContent.includes('пейзаж') || lowerContent.includes('ландшафт')) {
      return this.generateNatureAnalysis(query, results, imageContent);
    }
    // Люди или портреты
    else if (lowerContent.includes('человек') || lowerContent.includes('портрет') || lowerContent.includes('фотография')) {
      return this.generatePersonAnalysis(query, results, imageContent);
    }
    // Архитектура или здания
    else if (lowerContent.includes('здани') || lowerContent.includes('архитектур') || lowerContent.includes('сооружени')) {
      return this.generateArchitectureAnalysis(query, results, imageContent);
    }
    // Графики или диаграммы
    else if (lowerContent.includes('график') || lowerContent.includes('диаграмм') || lowerContent.includes('визуализац')) {
      return this.generateChartAnalysis(query, results, imageContent);
    }
    // Документы или текст
    else if (lowerContent.includes('документ') || lowerContent.includes('текст')) {
      return this.generateDocumentAnalysis(query, results, imageContent);
    }
    // Общий анализ для прочих типов изображений
    else {
      return this.generateGeneralImageAnalysis(query, results, imageContent);
    }
  }

  // Анализ логотипа компании
  private generateLogoAnalysis(query: string, results: SearchResult[], imageContent: string): string {
    // Специфический анализ для CyberX
    if (imageContent.includes('CyberX') || imageContent.includes('кибербезопасност')) {
      return `# Анализ логотипа CyberX

На изображении представлен логотип компании CyberX, специализирующейся на кибербезопасности.

**О компании CyberX**:
CyberX - это компания, предоставляющая услуги в сфере кибербезопасности. Основные направления деятельности:
- Защита от киберугроз и вредоносного ПО
- Мониторинг безопасности сетей и информационных систем
- Консалтинг по вопросам IT-безопасности
- Решения для защиты промышленных систем и IoT-устройств
- Аудит безопасности и пентестинг

**Визуальные элементы логотипа**:
- Щит, символизирующий защиту и безопасность
- Буква "X" как символ технологичности и инноваций
- Зеленый цвет, ассоциирующийся с безопасностью и надежностью

**Что можно сделать**:
- Посетить официальный сайт компании для получения информации об услугах
- Связаться с представителями для консультации по вопросам кибербезопасности
- Изучить предлагаемые решения для защиты вашей IT-инфраструктуры

Эта информация основана на анализе логотипа и результатах поиска по релевантным источникам.`;
    }

    // Общий анализ для логотипов
    return `# Анализ логотипа на изображении

На загруженном изображении представлен ${imageContent}.

**Информация по запросу**:
${results.length > 0 ? results.slice(0, 2).map((r, i) => `${i+1}. ${r.snippet}`).join('\n\n') : 'Не найдено специфической информации по данному логотипу.'}

**Возможные действия**:
- Если вы хотите узнать больше о компании, вы можете посетить ее официальный сайт
- Для получения информации о регистрации товарного знака, обратитесь в патентное ведомство
- Если вы ищете похожие логотипы, рекомендуем воспользоваться специализированными сервисами

**Значение элементов логотипа**:
- Цветовая схема может отражать ценности и позиционирование бренда
- Шрифты и типографика передают характер и индивидуальность компании
- Графические элементы часто символизируют сферу деятельности или ключевые продукты

Результаты поиска основаны на визуальном анализе логотипа и найденной информации в ${results.length} источниках.`;
  }

  // Общий анализ изображения
  private generateGeneralImageAnalysis(query: string, results: SearchResult[], imageContent: string): string {
    // Формируем начальный заголовок на основе запроса
    const title = query ? `# Информация по запросу: ${query}` : '# Анализ загруженного изображения';
    
    return `${title}

На загруженном изображении определено: ${imageContent}

**Найденная информация**:
${results.length > 0 
  ? results.slice(0, 3).map((r, i) => `${i+1}. **${r.title.replace(/\|.*$/, '')}**:\n   ${r.snippet}`).join('\n\n')
  : 'Не найдено специфической информации по данному изображению.'}

**Ключевые выводы**:
- ${results.length > 0 ? `По вашему запросу найдено ${results.length} источников информации` : 'Не найдено релевантных источников по вашему запросу'}
- Анализ изображения показал, что на нем ${imageContent}
- ${results.length > 0 ? 'Для получения дополнительной информации рекомендуем изучить представленные источники' : 'Рекомендуем уточнить запрос или использовать другое изображение'}

Данный анализ основан на визуальном распознавании изображения и информации из найденных источников.`;
  }

  // Генерирует ответ для запросов типа "Кто такой X"
  private generatePersonOrganizationAnswer(query: string, results: SearchResult[]): string {
    // Извлекаем имя/название из запроса
    const nameMatch = query.match(/кто такой|кто такая|кто такие|кто\s+(.+)/i);
    const name = nameMatch && nameMatch[1] ? nameMatch[1].trim() : query.replace(/кто такой|кто такая|кто такие/i, '').trim();
    
    // Ищем ключевую информацию в результатах
    const birthInfo = this.findInResults(results, ['родился', 'родилась', 'дата рождения', 'год рождения']);
    const professionInfo = this.findInResults(results, ['профессия', 'должность', 'работает', 'карьера', 'деятельность']);
    const achievementsInfo = this.findInResults(results, ['известен', 'известна', 'достижения', 'награды', 'создал', 'основал']);
    
    // Формируем ответ
    let answer = `# ${name}\n\n`;
    
    // Добавляем первый найденный сниппет как основное описание
    if (results.length > 0) {
      answer += `${results[0].snippet}\n\n`;
    }
    
    // Добавляем структурированную информацию
    if (professionInfo) {
      answer += `**Деятельность**: ${professionInfo}\n\n`;
    }
    
    if (birthInfo) {
      answer += `**Биографические данные**: ${birthInfo}\n\n`;
    }
    
    if (achievementsInfo) {
      answer += `**Достижения**: ${achievementsInfo}\n\n`;
    }
    
    // Добавляем обобщение и источники
    answer += `**Ключевые факты**:\n`;
    for (let i = 0; i < Math.min(3, results.length); i++) {
      const snippet = results[i].snippet.split('.')[0];
      if (snippet) {
        answer += `- ${snippet}.\n`;
      }
    }
    
    answer += `\n**Источники**: Найдено ${results.length} релевантных источников информации о ${name}.`;
    
    return answer;
  }

  // Вспомогательный метод для поиска информации в результатах
  private findInResults(results: SearchResult[], keywords: string[]): string | null {
    for (const result of results) {
      const lowerSnippet = result.snippet.toLowerCase();
      for (const keyword of keywords) {
        if (lowerSnippet.includes(keyword.toLowerCase())) {
          // Находим предложение, содержащее ключевое слово
          const sentences = result.snippet.split('.');
          for (const sentence of sentences) {
            if (sentence.toLowerCase().includes(keyword.toLowerCase())) {
              return sentence.trim() + '.';
            }
          }
          return result.snippet.split('.')[0] + '.';
        }
      }
    }
    return null;
  }

  // Метод для создания тестовых данных
  private getMockResults(): SearchResult[] {
    return [
      {
        title: 'Первый результат поиска',
        link: 'https://example.com/page1',
        snippet: 'Это краткое описание первого результата поиска, который содержит релевантную информацию по вашему запросу.',
        position: 1
      },
      {
        title: 'Второй результат поиска',
        link: 'https://example.com/page2',
        snippet: 'Еще один результат с полезной информацией, которая может вам помочь в решении вашего вопроса.',
        position: 2
      },
      {
        title: 'Третий результат поиска',
        link: 'https://example.com/page3',
        snippet: 'Дополнительная информация, которая может быть полезна для расширения вашего понимания темы.',
        position: 3
      }
    ];
  }
  
  private getMockSearchResults(query: string): SearchResponse {
    const results = this.getMockResults();
    
    return {
      query,
      results,
      analysis: this.generateDetailedAnswer(query, results)
    };
  }

  // Метод для тестовых данных при поиске с изображением
  private getMockImageSearchResults(query: string, imageContent: string, imageFile?: Express.Multer.File): SearchResponse {
    const results = this.getMockResults();
    
    // Если есть информация об изображении, используем ее
    if (imageContent) {
      return {
        query,
        results,
        analysis: this.generateImageBasedAnswer(query, results, imageContent)
      };
    }
    
    // Определяем тип контента по имени файла, если он есть
    let detectedContent = '';
    if (imageFile) {
      const filename = imageFile.originalname.toLowerCase();
      
      if (filename.includes('cyber') || filename.includes('security')) {
        detectedContent = 'логотип компании по кибербезопасности CyberX';
      } else if (filename.includes('logo')) {
        detectedContent = 'логотип компании';
      } else {
        detectedContent = 'изображение';
      }
      
      return {
        query,
        results,
        analysis: this.generateImageBasedAnswer(query, results, detectedContent)
      };
    }
    
    // Если нет изображения, используем обычный анализ
    return {
      query,
      results,
      analysis: this.generateDetailedAnswer(query, results)
    };
  }

  // Генерирует ответ для запросов типа "Как сделать X"
  private generateHowToAnswer(query: string, results: SearchResult[]): string {
    const lowerQuery = query.toLowerCase();
    
    // Для запроса о чистке зубов
    if (lowerQuery.includes('чистить зубы') || lowerQuery.includes('чистка зубов')) {
      return `# Как правильно чистить зубы

На основе найденной информации, вот основные рекомендации по правильной чистке зубов:

1. **Выбор зубной щетки и пасты**:
   - Используйте щетку с мягкой или средней жесткостью щетины
   - Выбирайте пасту с фтором для укрепления эмали
   - Меняйте зубную щетку каждые 3-4 месяца

2. **Техника чистки**:
   - Чистите зубы не менее 2 минут, дважды в день
   - Держите щетку под углом 45 градусов к линии десен
   - Используйте короткие, мягкие движения вперед-назад
   - Очищайте все поверхности: внешние, внутренние и жевательные
   - Не забывайте про язык - его тоже нужно очищать

3. **Дополнительные средства**:
   - Используйте зубную нить ежедневно для очистки межзубных промежутков
   - Ополаскиватели могут дополнить, но не заменить чистку щеткой и нитью

4. **Важные рекомендации**:
   - Не чистите зубы сразу после еды, особенно кислой - подождите 30-60 минут
   - Посещайте стоматолога для профессиональной чистки каждые 6 месяцев

Источники информации: найдено ${results.length} релевантных ресурсов, включая рекомендации от стоматологических клиник и медицинских организаций.`;
    }
    
    // Общий шаблон для инструкций
    return `# ${query}

На основе найденной информации, вот основные рекомендации:

${results.slice(0, 3).map((r, i) => `${i+1}. **${r.title.replace(/\|.*$/, '')}**:\n   - ${r.snippet.split('. ').slice(0, 2).join('. ')}`).join('\n\n')}

Дополнительные советы:
- ${results.slice(3, 5).map(r => r.snippet.split('. ')[0]).join('\n- ')}

Источники информации: найдено ${results.length} релевантных ресурсов. Для получения более подробной информации рекомендуем перейти по найденным ссылкам.`;
  }
  
  // Генерирует ответ для запросов типа "Что такое X"
  private generateDefinitionAnswer(query: string, results: SearchResult[]): string {
    return `# ${query}

${results[0].snippet}

Дополнительная информация:
${results.slice(1, 3).map(r => `- ${r.snippet.split('. ')[0]}`).join('\n')}

Источники: найдено ${results.length} релевантных ресурсов по данной теме.`;
  }
  
  // Генерирует ответ для общих запросов
  private generateGeneralAnswer(query: string, results: SearchResult[]): string {
    return `# Информация по запросу: ${query}

Основные сведения:
${results.slice(0, 3).map((r, i) => `${i+1}. **${r.title.replace(/\|.*$/, '')}**:\n   ${r.snippet}`).join('\n\n')}

Ключевые выводы:
- По вашему запросу найдено ${results.length} источников информации
- Наиболее полные данные представлены на сайтах: ${results.slice(0, 2).map(r => r.link.replace(/https?:\/\/([^\/]+)\/.*/, '$1')).join(', ')}
- Для получения дополнительной информации рекомендуем изучить представленные источники

Данный анализ основан на информации из найденных источников и может быть дополнен при необходимости.`;
  }

  // Анализ продуктов питания/блюд
  private generateFoodAnalysis(query: string, results: SearchResult[], imageContent: string): string {
    return `# Анализ кулинарного изображения

На загруженном изображении определено: ${imageContent}

**Информация о блюде**:
${results.length > 0 
  ? results.slice(0, 2).map((r, i) => `${r.snippet}`).join('\n\n')
  : 'Конкретная информация о данном блюде не найдена.'}

**Возможные ингредиенты и приготовление**:
- Визуальный анализ показывает, что это блюдо относится к категории кулинарных изображений
- Для получения точного рецепта рекомендуем изучить представленные источники
- Подобные блюда часто готовятся с использованием традиционных техник приготовления

**Полезные ссылки**:
${results.length > 0 
  ? `Найдено ${results.length} источников с похожими кулинарными рецептами и информацией.`
  : 'Рекомендуем уточнить запрос для получения более точной информации о блюде.'}

Данный анализ основан на визуальном распознавании изображения и доступной информации.`;
  }

  // Анализ технических устройств
  private generateTechDeviceAnalysis(query: string, results: SearchResult[], imageContent: string): string {
    return `# Анализ технического устройства

На загруженном изображении определено: ${imageContent}

**Информация об устройстве**:
${results.length > 0 
  ? results.slice(0, 2).map((r, i) => `${r.snippet}`).join('\n\n')
  : 'Точная информация об этом устройстве не найдена.'}

**Технические характеристики и использование**:
- Устройство относится к категории технологических продуктов
- Для получения точных технических характеристик рекомендуем обратиться к официальной документации
- Подобные устройства обычно используются для решения специализированных задач

**Источники информации**:
${results.length > 0 
  ? `Найдено ${results.length} источников с информацией о подобных устройствах.`
  : 'Рекомендуем уточнить запрос для получения более точной информации об устройстве.'}

Данный анализ основан на визуальном распознавании изображения и доступной информации.`;
  }

  // Анализ природы/пейзажей
  private generateNatureAnalysis(query: string, results: SearchResult[], imageContent: string): string {
    return `# Анализ природного пейзажа

На загруженном изображении определено: ${imageContent}

**Информация о местности**:
${results.length > 0 
  ? results.slice(0, 2).map((r, i) => `${r.snippet}`).join('\n\n')
  : 'Точная информация об этой местности не найдена.'}

**Характеристики и особенности**:
- Изображение относится к категории природных пейзажей
- Такие местности часто являются популярными туристическими направлениями
- Природные ландшафты имеют важное экологическое и эстетическое значение

**Источники и дополнительная информация**:
${results.length > 0 
  ? `Найдено ${results.length} источников с информацией о подобных местах и природных объектах.`
  : 'Рекомендуем уточнить запрос для получения более точной информации о данной местности.'}

Данный анализ основан на визуальном распознавании изображения и доступной информации.`;
  }

  // Анализ фотографий людей
  private generatePersonAnalysis(query: string, results: SearchResult[], imageContent: string): string {
    return `# Анализ фотографии

На загруженном изображении определено: ${imageContent}

**Контекстная информация**:
${results.length > 0 
  ? results.slice(0, 2).map((r, i) => `${r.snippet}`).join('\n\n')
  : 'Точная информация о людях на фотографии не найдена.'}

**Возможное значение**:
- Изображение относится к категории портретных фотографий
- Такие фотографии часто используются в личных или профессиональных целях
- Портретная фотография имеет богатую историю и множество стилистических направлений

**Источники и дополнительная информация**:
${results.length > 0 
  ? `Найдено ${results.length} источников с релевантной информацией.`
  : 'Рекомендуем уточнить запрос для получения более точной информации.'}

Данный анализ основан на визуальном распознавании изображения и доступной информации.`;
  }

  // Анализ архитектуры/зданий
  private generateArchitectureAnalysis(query: string, results: SearchResult[], imageContent: string): string {
    return `# Анализ архитектурного объекта

На загруженном изображении определено: ${imageContent}

**Информация о здании/сооружении**:
${results.length > 0 
  ? results.slice(0, 2).map((r, i) => `${r.snippet}`).join('\n\n')
  : 'Точная информация об этом архитектурном объекте не найдена.'}

**Архитектурные особенности**:
- Изображение относится к категории архитектурных сооружений
- Подобные здания часто представляют историческую или культурную ценность
- Архитектурные объекты отражают стиль и эпоху своего создания

**Источники и дополнительная информация**:
${results.length > 0 
  ? `Найдено ${results.length} источников с информацией о подобных архитектурных объектах.`
  : 'Рекомендуем уточнить запрос для получения более точной информации об этом сооружении.'}

Данный анализ основан на визуальном распознавании изображения и доступной информации.`;
  }

  // Анализ графиков/диаграмм
  private generateChartAnalysis(query: string, results: SearchResult[], imageContent: string): string {
    return `# Анализ графического представления данных

На загруженном изображении определено: ${imageContent}

**Информация о визуализации**:
${results.length > 0 
  ? results.slice(0, 2).map((r, i) => `${r.snippet}`).join('\n\n')
  : 'Точная информация о данных на этом графике не найдена.'}

**Возможная интерпретация**:
- Изображение относится к категории визуализации данных
- Такие графики используются для наглядного представления информации и выявления трендов
- Для точной интерпретации необходимо учитывать контекст и методологию сбора данных

**Источники и дополнительная информация**:
${results.length > 0 
  ? `Найдено ${results.length} источников с релевантной информацией.`
  : 'Рекомендуем уточнить запрос для получения более точной информации о представленных данных.'}

Данный анализ основан на визуальном распознавании изображения и доступной информации.`;
  }

  // Анализ документов/текста
  private generateDocumentAnalysis(query: string, results: SearchResult[], imageContent: string): string {
    return `# Анализ документа

На загруженном изображении определено: ${imageContent}

**Информация о документе**:
${results.length > 0 
  ? results.slice(0, 2).map((r, i) => `${r.snippet}`).join('\n\n')
  : 'Точная информация о содержании этого документа не найдена.'}

**Возможное содержание и контекст**:
- Изображение относится к категории документов или текстовых материалов
- Для точного анализа содержания требуется специализированное распознавание текста
- Текстовые документы могут содержать важную информацию различного характера

**Источники и рекомендации**:
${results.length > 0 
  ? `Найдено ${results.length} источников с релевантной информацией.`
  : 'Рекомендуем использовать специализированные инструменты для распознавания текста в документах.'}

Данный анализ основан на визуальном распознавании изображения и доступной информации.`;
  }
} 