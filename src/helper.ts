import {
    Manga,
    Html,
    MangaPageResult,
    MangaStatus,
    MangaViewer,
    Chapter,
    Page,
    ValueRef,
    console
} from 'aidoku-as';

export class Parser {
    parseHomePage(document: Html): MangaPageResult {
        let result: Manga[] = [];

        let elements = document.select('div.d-flex > div').array();

        for (let i=0; i < elements.length; i++) {
            let elem = elements[i];
            const id = elem.select('a').attr('href').replace('/manga/', '').replace('/', '');
            const title = elem.select('p').select('a').text().trim();
            const img = "https://www.japscan.ws/"+ elem.select('img.img-fluid').attr('src');
            let manga = new Manga(id, title);
            manga.cover_url = img;
            result.push(manga);
        }
        document.close();
        return new MangaPageResult(result, result.length != 0);
    }

    parseLatest(document: Html, latest: boolean): MangaPageResult {
        let result: Manga[] = [];

        if (latest) {
            let elements = document.select('div#chapters > div#tab-1 > h3').array();
            for (let i=0; i < elements.length; i++) {
                let elem = elements[i];
                const id = elem.select('a').attr('href').replace('/manga/', '').replace('/', '');
                const title = elem.select('a').text().trim();
                const img = `https://www.japscan.ws/imgs/mangas/${id}.jpg`
                let manga = new Manga(id, title);
                manga.cover_url = img;
                result.push(manga);
            }
        } else {
            let elements = document.select('div#top_mangas_all_time > ol > li').array();
            for (let i=0; i < elements.length; i++) {
                let elem = elements[i];
                const id = elem.select('a.font-weight-bold').attr('href').replace('/manga/', '').replace('/', '');
                const title = elem.select('a.font-weight-bold').text().trim();
                const img = `https://www.japscan.ws/imgs/mangas/${id}.jpg`
                let manga = new Manga(id, title);
                manga.cover_url = img;
                result.push(manga);
            }
        }

        document.close();
        return new MangaPageResult(result, false);
    }
 
    getMangaDetails(document: Html, mangaId: string): Manga{
        const title = document.select('div.rounded-0 > h1').text().trim();
        let manga = new Manga(mangaId, title);

        const infos = document.select('div.m-2 > p.mb-2').array();
        let tags: string[] = [];
        for (let i=0; i < infos.length; i++) {
            let infoTxt = infos[i].select('span').text().trim();
            if (infoTxt == 'Auteur(s):')  manga.author = infos[i].text().trim().split(" ").slice(1).join(' ');
            if (infoTxt == 'Statut:') {
                if (infos[i].text().trim().split(" ").slice(1).join(' ').trim() == 'Terminé') {
                    manga.status = MangaStatus.Completed;
                } else {
                    manga.status = MangaStatus.Ongoing;
                }
            }

            if (infoTxt == 'Genre(s):') {
                tags = infos[i].text().trim().split(":").slice(1).join().split(', ');
            }
        }

        manga.categories = tags;
        manga.description = document.select("p.list-group-item-primary").text().trim();

        manga.cover_url = `https://www.japscan.ws/imgs/mangas/${mangaId}.jpg`
        manga.url = `https://www.japscan.ws/manga/${mangaId}/`;
        manga.viewer = MangaViewer.RTL;
        document.close();
        return manga
    }

    getChapterList(document: Html, mangaId: string): Chapter[] {
        let chapters: Chapter[] = [];

        let elements = document.select('div#chapters_list > div > div.chapters_list').array();

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const url = `https://www.japscan.ws${element.select('a').attr('href')}`;
            const id = element.select('a').attr('href').split('/lecture-en-ligne/').join('').trim();
            const title = element.select('a').text().trim();

            
            let dateString = element.select('span').text().trim();
            let dateObject = ValueRef.string(dateString);
            let date = dateObject.toDate('d MMM yyyy', 'en_US')

            let curr_chapter = new Chapter(id, title);
            curr_chapter.url = url;
            curr_chapter.lang = 'fr';
            curr_chapter.dateUpdated = date;
            chapters.push(curr_chapter);
        }
        document.close();
        return chapters;
    }

    getPageList(document: Html): Page[] {
        let pages: Page[] = [];
        const elements = document.select('#pages > option').array();
        if (elements.length == 0) {
            const tmp = new Page(0);
            tmp.url = 'https://i.imgur.com/ovHuAps.png'
            pages.push(tmp);
        }

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            let page = new Page(i);
            const url = element.attr('data-img')
            page.url = `https://cdn.statically.io/img/${url.split('https://').join('')}`;
            console.log(`https://cdn.statically.io/img/${url.split('https://').join('')}`);
            pages.push(page);
        }

        return pages;
    }
}

export class FilterMap {
    private genreValues: Map<string, string>  = new Map<string, string>();
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }
}
