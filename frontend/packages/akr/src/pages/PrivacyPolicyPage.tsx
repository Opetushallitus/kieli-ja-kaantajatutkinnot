import { ArrowBackIosOutlined as ArrowBackIosOutlinedIcon } from '@mui/icons-material';
import { Grid, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CustomButtonLink,
  ExtLink,
  H1,
  H2,
  HeaderSeparator,
  Text,
} from 'shared/components';
import { Variant } from 'shared/enums';
import { CommonUtils } from 'shared/utils';

import { useCommonTranslation, usePrivacyTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

const BackButton = () => {
  const translateCommon = useCommonTranslation();

  return (
    <CustomButtonLink
      to={AppRoutes.PublicHomePage}
      variant={Variant.Text}
      startIcon={<ArrowBackIosOutlinedIcon />}
      className="color-secondary-dark"
    >
      {translateCommon('backToHomePage')}
    </CustomButtonLink>
  );
};

const BulletList = ({ items }: { items: Array<string> }) => {
  return (
    <ul>
      <Text>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </Text>
    </ul>
  );
};

export const PrivacyPolicyPage = () => {
  const translatePrivacy = usePrivacyTranslation();
  const { pathname } = useLocation();

  useEffect(() => {
    CommonUtils.scrollToTop();
  }, [pathname]);

  return (
    <Grid
      className="privacy-policy-page"
      container
      rowSpacing={4}
      direction="column"
    >
      <Grid item className="privacy-policy-page__heading">
        <H1>{translatePrivacy('heading')}</H1>
        <HeaderSeparator />
      </Grid>
      <Grid item>
        <Paper
          className="privacy-policy-page__content rows gapped-xxl"
          elevation={3}
        >
          <div>
            <BackButton />
          </div>
          <div className="rows gapped">
            <H2>Rekisterin nimi</H2>
            <Text>Auktorisoitujen kääntäjien rekisteri</Text>
            <Text>
              Rekisteri koostuu seuraavista:
              <BulletList
                items={[
                  'rekisteriin merkityt auktorisoidut kääntäjät',
                  'julkinen hakukone',
                ]}
              />
            </Text>
          </div>
          <div className="rows gapped">
            <H2>Rekisterin pitäjä</H2>
            <Text>Opetushallitus</Text>
            <Text>
              PL 380, 00531 Helsinki
              <br />
              Käyntiosoite Hakaniemenranta 6, 00530 Helsinki
            </Text>
            <Text>
              Muut yhteystiedot
              <br />
              Sähköposti:{' '}
              <ExtLink
                className="privacy-policy-page__content__link"
                href="mailto:opetushallitus@oph.fi"
                text="opetushallitus@oph.fi"
              />
              {', '}
              <ExtLink
                className="privacy-policy-page__content__link"
                href="mailto:kirjaamo@oph.fi"
                text="kirjaamo@oph.fi"
              />
              <br />
              Puhelinvaihde: 029 533 1000
            </Text>
          </div>
          <div className="rows gapped">
            <H2>Rekisterinpitäjän edustaja (yhteyshenkilö)</H2>
            <Text>
              Terhi Seinä
              <br />
              Sähköposti:{' '}
              <ExtLink
                className="privacy-policy-page__content__link"
                href="mailto:kirjaamo@oph.fi"
                text="kirjaamo@oph.fi"
              />
              <br />
              Puhelin: 029 533 1000 (vaihde)
            </Text>
            <Text>
              Tietosuojavastaavan yhteystiedot
              <br />
              Jyrki Tuohela
              <br />
              Sähköposti{' '}
              <ExtLink
                className="privacy-policy-page__content__link"
                href="mailto:tietosuoja@oph.fi"
                text="tietosuoja@oph.fi"
              />
              <br />
              Puhelin 029 533 1000 (vaihde)
            </Text>
          </div>
          <div className="rows gapped">
            <H2>
              Henkilötietojen käsittelyn tarkoitus sekä käsittelyn oikeusperuste
            </H2>
            <Text>
              Auktorisoitujen kääntäjien rekisteriin on tallennettu tiedot
              auktorisoiduista kääntäjistä, joille Auktorisoitujen kääntäjien
              tutkintolautakunta on myöntänyt hakemuksesta auktorisoidun
              kääntäjän oikeuden.
            </Text>
            <Text>
              Rekisterin julkisesta hakukoneesta voi etsiä auktorisoituja
              kääntäjiä ja jättää heille yhteydenottopyynnön
              käännöstoimeksiantoa varten. Rekisteristä voi myös tehdä hakuja
              ilman että jättää yhteydenottopyyntöä.
            </Text>
            <Text>
              Rekisteriin tallennetaan ja siinä käsitellään henkilötietoja,
              jotka ovat tarpeellisia auktorisointien hallinnoinnin ja edellä
              mainittujen yhteydenottopyyntöjen sekä muutostarpeiden
              hoitamiseksi.
            </Text>
            <Text>
              Kysyttäessä suostumusta julkaisulupaan rekisteröidyltä pyydetään
              lupa etukäteen ja samassa yhteydessä annetaan selvitys tällä
              lomakkeella, miten tietoja käsitellään.
            </Text>
            <Text>
              <b>Lakiperusteet</b>
              <br />
              Laki auktorisoiduista kääntäjistä{' '}
              <ExtLink
                className="privacy-policy-page__content__link"
                href="https://www.finlex.fi/fi/laki/ajantasa/2007/20071231"
                text="https://www.finlex.fi/fi/laki/ajantasa/2007/20071231"
              ></ExtLink>
              <br />
              15§
            </Text>
          </div>
          <div className="rows gapped">
            <H2>Rekisterin tietosisältö / käsiteltävät henkilötietoryhmät </H2>
            <Text>
              <b>Ryhmä 1</b>: Hakukoneen käyttäjät Yhteydenottopyyntö jätetty
              auktorisoidulle kääntäjälle
              <br />
              <b>Ryhmä 2</b>: Hakukoneen käyttäjät Hakukoneen tietojen
              selaaminen/ hakujen teko
              <br />
              <b>Ryhmä 3</b>: Rekisteriin merkityt auktorisoidut kääntäjät
              Hakukoneeseen merkitään julkaisuluvan antaneen auktorisoidun
              kääntäjän nimi, asuinpaikka sekä kielipari(t), jo(i)ssa kääntäjä
              on auktorisoitu.
            </Text>
            <Text>
              Ryhmä 1: Hakukoneen käyttäjät Yhteydenottopyyntö jätetty
              auktorisoidulle kääntäjälle: Henkilötiedot: Pääasiallisesti
              henkilötiedot kerätään käyttäjältä itseltään yhteydenottolomakkeen
              jättämisen yhteydessä. Käyttäjän antamat tiedot: nimi,
              sähköpostiosoite ja puhelinnumero. Muut tiedot: käyttäjien viestit
              koskien käännöstoimeksiantoa. Tietoja säilytetään 6 kk.
            </Text>
            <Text>
              Ryhmä 2: Hakukoneen käyttäjät Hakukoneen tietojen selaaminen/
              hakujen teko Mitään tietoa ei tallennu.
            </Text>
            <Text>Ryhmä 3: Rekisteriin merkityt auktorisoidut kääntäjät</Text>
            <Text>
              Kääntäjiä auktorisoidaan kolmella perusteella:
              <BulletList
                items={[
                  'hyväksytysti suoritettu auktorisoidun kääntäjän tutkinto',
                  'maisterin tutkinnossa suoritettu kääntämisen korkeakouluopinnot (60 opintopistettä, johon sisältyy  auktorisoidun kääntämisen 6 opintopistettä)',
                  'virallinen kääntäjä',
                ]}
              />
            </Text>
            <Text>
              Kaksi ensin mainittua uusivat auktorisoidun kääntäjän oikeutensa 5
              vuoden välein. Viralliselle kääntäjälle myönnetään auktorisointi
              ilman takarajaa. Opetushallitus lähettää rekisteristä muistutuksen
              3 kk ennen auktorisoinnin umpeutumista. Jos auktorisointi
              umpeutuu, poistetaan kääntäjä julkisesta hakukoneesta. Kääntäjä
              voi milloin tahansa hakea auktorisointia uudelleen.
            </Text>
            <Text>
              Rekisteröitävän antamat tiedot Henkilötiedot: nimi, henkilötunnus,
              osoite, sähköpostiosoite, puhelinnumero ja asuinpaikka.
            </Text>
            <Text>
              Muut tiedot:
              <br />
              <BulletList
                items={[
                  'auktorisointiperuste',
                  'mistä kielestä mihin kieleen kääntäjä on auktorisoitu tekemään käännöksiä',
                ]}
              />
            </Text>
          </div>
          <div className="rows gapped">
            <H2>Henkilötietojen vastaanottajat tai vastaanottajaryhmät</H2>
            <Text>
              Opetushallituksen on viranomaisten toiminnan julkisuudesta annetun
              lain (21.5.1999/621) mukaan annettava tieto julkisesta
              asiakirjasta pyytäjälle, vaikka asiakirja sisältäisi
              henkilötietoja. Salassa pidettävän tiedon antaminen tai
              luovuttaminen edellyttää erityistä perustetta: asianosaisasema tai
              laissa säädetty oikeus tiedon saamiseen tai sen henkilön
              suostumus, jonka suojaksi salassapidosta on säädetty.
            </Text>
            <Text>
              Henkilötietoja voidaan luovuttaa tieteellistä tai historiallista
              tutkimusta taikka tilastointia varten tietosuojalain (1050/2018) 4
              §:n mukaisin edellytyksin.
            </Text>
            <Text>
              Tietojärjestelmän palveluntarjoajat (henkilötietojen käsittelijät)
              pääsevät tarkastelemaan rekisterin sisältämiä henkilötietoja
              Opetushallituksen määrittämässä laajuudessa.
            </Text>
            <Text>Tietoja ei luovuteta suoramarkkinointiin.</Text>
          </div>
          <div className="rows gapped">
            <H2>Rekisterinpitäjän edustaja (yhteyshenkilö)</H2>
            <Text>
              Terhi Seinä
              <br />
              ähköposti:kirjaamo@oph.fi
              <br />
              Puhelin: 029 533 1000 (vaihde)
            </Text>
            <Text>
              Tietosuojavastaavan yhteystiedot
              <br />
              Jyrki Tuohela
              <br />
              Sähköposti tietosuoja@oph.fi
              <br />
              Puhelin 029 533 1000 (vaihde)
            </Text>
          </div>
          <div className="rows gapped">
            <H2>
              Tiedot tietojen siirrosta kolmansiin maihin ja tiedot
              käytettävistä suojatoimista (sis. tiedon komission tietosuojan
              riittävyyttä koskevasta päätöksen olemassaolosta tai
              puuttumisesta) ja keinot saada kopio tai tieto niiden sisällöstä.
            </H2>
            <Text>
              Tietoja ei säännönmukaisesti luovuta tai siirretä rekisteristä
              EU:n tai Euroopan talousalueen ulkopuolelle.
            </Text>
          </div>
          <div className="rows gapped">
            <H2>Henkilötietojen säilyttämisaika</H2>
            <Text>
              Ryhmä 1
              <br />
              Tietoja säilytetään 6 kk.
            </Text>
            <Text>
              Ryhmä 3
              <br />
              Tiedot poistetaan rekisteristä ilman aiheetonta viivytystä ja
              viimeistään 2 kuukauden kuluttua siitä, kun auktorisointi on
              päättynyt tai peruutettu. Palvelun henkilötietojen säilytysajat
              ovat arkistonmuodostussuunnitelman ja tiedonohjaussuunnitelman
              määrittämien säilytysaikojen mukaisia. Asiakirjat, joiden
              säilytysaika on päättynyt, hävitetään järjestelmästä vuosittain.
            </Text>
          </div>
          <div className="rows gapped">
            <H2>
              Rekisteröidyn oikeudet
              <br />
              <BulletList
                items={[
                  'Oikeus saada pääsy henkilötietoihin ',
                  'Oikeus tietojen oikaisemiseen',
                  'Oikeus tietojen poistamiseen',
                  'Oikeus käsittelyn rajoittamiseen',
                  'Vastustamisoikeus',
                  'Oikeus siirtää tiedot järjestelmästä toiseen',
                ]}
              />
            </H2>
            <Text>
              Rekisteröidyllä on oikeus saada rekisterinpitäjältä vahvistus
              siitä, että häntä koskevia henkilötietoja käsitellään tai että
              niitä ei käsitellä. Rekisterinpitäjän on toimitettava pyynnöstä
              jäljennös käsiteltävistä henkilötiedoista.
            </Text>
            <Text>
              Rekisteröidyllä on oikeus vaatia, että rekisterinpitäjä oikaisee
              ilman aiheetonta viivytystä rekisteröityä koskevat epätarkat ja
              virheelliset henkilötiedot. Rekisteröidyn tulee yksilöidä ja
              perustella, mitä tietoa hän vaatii korjattavaksi, mikä on hänen
              mielestään oikea tieto ja miten korjaus halutaan tehtäväksi.
            </Text>
            <Text>
              Mikäli käsittely perustuu tietosuoja-asetuksen 6 artiklan 1a
              -kohtaan tai 9 artiklan 2a -kohtaan eli rekisteröidyn
              suostumukseen, on rekisteröidyllä oikeus tietojen poistamiseen.
            </Text>
            <Text>
              Rekisteröidyllä on oikeus käsittelyn rajoittamiseen tietyissä
              tilanteissa. Rekisteröidyllä on oikeus siihen, että
              rekisterinpitäjä ilmoittaa henkilötietojesi oikaisusta tai
              poistosta tai käsittelyn rajoituksesta sille jolle tietoja on
              edelleen luovutettu, mikäli tietoja luovutetaan eteenpäin.
              Rekisteröidyllä on oikeus saada tiedot siirrettyä järjestelmästä
              toiseen, jos käsittely suoritetaan automaattisesti Oikeuksien
              käyttöön liittyvät pyynnöt tulee osoittaa rekisterin
              yhteyshenkilölle: Opetushallitus, PL 380, 00531 Helsinki.
              Tarkastuspyyntöön rekisteröidyn tulee liittää tietojen etsimiseen
              tarvittavat tiedot (nimi ja henkilötunnus).
            </Text>
            <Text>
              Jos rekisteröidyn käyttämästä henkilötietojen tarkastusoikeudesta
              on kulunut vähemmän kuin yksi vuosi, voi rekisterinpitäjä periä
              tietojen antamisesta aiheutuvat hallinnollisiin kustannuksiin
              perustuvan maksun (artikla 12 [5]).
            </Text>
          </div>
          <div className="rows gapped">
            <H2>Oikeus tehdä valitus valvontaviranomaiselle</H2>
            <Text>
              Rekisteröidyllä on oikeus tehdä kantelu valvontaviranomaiselle,
              erityisesti siinä jäsenvaltiossa, jossa hänen vakinainen
              asuinpaikkansa tai työpaikkansa on, tai jossa väitetty
              tietosuoja-asetuksen rikkominen on tapahtunut.
            </Text>
          </div>
          <div className="rows gapped">
            <H2>
              Tiedot siitä, mistä henkilötiedot on saatu sekä tarvittaessa
              siitä, onko tiedot saatu yleisesti saatavilla olevista lähteistä
            </H2>
            <Text>
              Tiedot kerätään ryhmässä 1. ja ryhmässä 3 henkilöltä itseltään.
            </Text>
          </div>
          <div className="rows gapped">
            <H2>
              Tiedot automaattisen päätöksenteon, ml. profiloinnin
              olemassaolosta, sekä ainakin näissä tapauksissa merkitykselliset
              tiedot käsittelyyn liittyvästä logiikasta samoin kuin kyseisen
              käsittelyn merkittävyys ja mahdolliset seuraukset rekisteröidylle
            </H2>
            <Text>
              Rekisterin sisältämiä tietoja ei käytetä profilointiin eikä
              tietoihin kohdisteta automaattista päätöksentekoa.
            </Text>
          </div>
          <div>
            <BackButton />
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
};
