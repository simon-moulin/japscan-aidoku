import {
    Manga,
    Html,
    MangaPageResult,
    MangaStatus,
    MangaContentRating,
    MangaViewer,
    Chapter,
    Page,
    Filter,
    FilterType,
    ValueRef,
} from 'aidoku-as';

export class Parser {
    parseHomePage(document: Html, listType: boolean): MangaPageResult {
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
            // TODO: check the manga status

            // TODO: Add type in tags

            if (infoTxt == 'Genre(s):') {
                tags = infos[i].text().trim().split(":").slice(1).join().split(', ');
            }
        }

        manga.categories = tags;
        manga.description = document.select("p.list-group-item-primary").text().trim();


        manga.cover_url = `https://www.japscan.ws/imgs/mangas/${mangaId}.jpg`
        manga.url = `https://www.japscan.ws/manga/${mangaId}/`;
        manga.status = MangaStatus.Ongoing;
        manga.viewer = MangaViewer.RTL;
        document.close();
        return manga
    }

    getChapterList(document: Html, mangaId: string): Chapter[] {
        let chapters: Chapter[] = [];
        return chapters;
    }

    getPageList(document: Html): Page[] {
        let page: Page[] = [];
        return page;
    }
}

export class FilterMap {
    private genreValues: Map<string, string>  = new Map<string, string>();
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }
}
