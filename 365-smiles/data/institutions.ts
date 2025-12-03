// /src/data/institutions.ts

export type InstitutionType = "charity" | "orphanage" | "old_age_home";

export interface Institution {
  name: string;
  type: InstitutionType[];
  district: string;
  contactDetails: string;
  address: string;
  locationLink?: string;
  website?: string;
  source?: string;
}

export interface DistrictInstitutions {
  district: string;
  institutions: Institution[];
}

export const karnatakaInstitutions: DistrictInstitutions[] = [
  {
    district: "Bengaluru Urban",
    institutions: [
      // OLD AGE HOMES
      {
        name: "Asha Nivas",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-25554636; Contact: Rev. Nirmala Vasanthkumar",
        address: "132, St. John's Church Campus, St. John's Church Road, PB No. 544, Bengaluru – 560005, Karnataka",
        locationLink: "https://maps.google.com/?q=Asha+Nivas+St+Johns+Church+Road+Bangalore",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Eventide Home Association",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-22214534; Contact: Mrs. E. Blackham",
        address: "No.5, Rajaram Mohan Roy Road, Bengaluru – 560025, Karnataka",
        locationLink: "https://maps.google.com/?q=Eventide+Home+Association+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Maneyangala Oldage Home",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-23465254 / 080-20123088; Contact: Mr. B.S. SriRanga Mani",
        address: "No.45, Sampige Road, Between 3rd & 4th Cross, Malleshwaram, Bengaluru – 560003, Karnataka",
        locationLink: "https://maps.google.com/?q=Maneyangala+Oldage+Home+Malleshwaram+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Nightingales Elders Enrichment Centre",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: +91-80-23342929 / +91-80-41244017; Email: nightingales@vsnl.net",
        address: "No.18/1, 1st Cross, Vyalikaval Extension, Malleswaram, Bengaluru – 560003, Karnataka",
        locationLink: "https://maps.google.com/?q=Nightingales+Elders+Enrichment+Centre+Malleswaram+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Om Ashram Trust",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-26581682 / 080-64530629; Contact: Mrs. Geetha Shankar",
        address: "No.573, 6th Main Road, Rajajinagar 1st Block, Bengaluru – 560010, Karnataka",
        locationLink: "https://maps.google.com/?q=Om+Ashram+Trust+Rajajinagar+Bengaluru",
        website: "www.omashrambengaluru.org",
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Ragavendra Vrudhashrama",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-41138512 / 080-23449479; Mobile: 9844210226; Contact: Mrs. Holla",
        address: "No.165, 9th Cross, 4th Main Road, Near Rajajinagar Police Station, Bengaluru – 560010, Karnataka",
        locationLink: "https://maps.google.com/?q=Ragavendra+Vrudhashrama+Rajajinagar+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Stephens Home for the Aged",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-25513805; Contact: Rev. Nirmala Vasanth Kumar",
        address: "No.14, Claredon Road, Richmond Town, Bengaluru – 560025, Karnataka",
        locationLink: "https://maps.google.com/?q=Stephens+Home+for+the+Aged+Richmond+Town+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "The Bangalore Friend in-need Society",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-22865519; Contact: Allan Jones",
        address: "No.3, Colonel Harding Street, Near Cubbon Park, Bengaluru – 560001, Karnataka",
        locationLink: "https://maps.google.com/?q=Bangalore+Friend+in-need+Society+Cubbon+Park+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Vallabha Nikethan, Vishwaneedam Trust",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-22269794 / 9886174116; Contact: Girija Hegde",
        address: " No.304, 6th Cross, Wilson Garden, Bengaluru – 560027, Karnataka",
        locationLink: "https://maps.google.com/?q=Vallabha+Nikethan+Wilson+Garden+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Villa Maria Senior Citizens Home",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-22111481 / 080-22111482; Contact: Rasquinha",
        address: "Maria Kripa Road, Near Kempegowda Bus Station, Majestic, Bengaluru – 560009, Karnataka",
        locationLink: "https://maps.google.com/?q=Villa+Maria+Senior+Citizens+Home+Majestic+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Cleta's Home",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-41116975 / 080-25531617; Mobile: 7829767316; Email: cletashome@gmail.com",
        address: "No.113/2, 9th Cross, 2nd Main, Malleshwaram, Bengaluru – 560003, Karnataka",
        locationLink: "https://maps.google.com/?q=Cletas+Home+Malleshwaram+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Don Guanella Aged Home",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-28445501; Fax: 080-28443550; Mobile: 7204900821",
        address: "Guanella Preethi Nivas, Okalipuram, Krumbiegel Road, Bengaluru – 560003, Karnataka",
        locationLink: "https://maps.google.com/?q=Don+Guanella+Aged+Home+Okalipuram+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Holy Family Home for the Aged",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-25444360; Mobile: 9845999237",
        address: "Veerannapalya, Nagavara, Bengaluru – 560045, Karnataka",
        locationLink: "https://maps.google.com/?q=Holy+Family+Home+for+the+Aged+Nagavara+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Little Sisters of the Poor (Hennuru Road)",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-25444684; Mobile: 9480051611; Email: lspmsbangps@gmail.com",
        address: "St. Monica's Seva Sadana, Hennur Road, Banaswadi, Bengaluru – 560043, Karnataka",
        locationLink: "https://maps.google.com/?q=Little+Sisters+of+the+Poor+Hennur+Road+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Little Sisters of the Poor (Hosuru Road)",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-22270273; Mobile: 9663617423; Email: ispbangalorestjoseph@gmail.com",
        address: "St. Joseph's Home for the Aged, Hosur Road, Near Electronic City, Bengaluru – 560100, Karnataka",
        locationLink: "https://maps.google.com/?q=Little+Sisters+of+the+Poor+Hosur+Road+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Home for the Sick and Dying Destitute",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-28571074",
        address: "Missionaries of Charity, New Airport Road, Bengaluru – 560017, Karnataka",
        locationLink: "https://maps.google.com/?q=Missionaries+of+Charity+New+Airport+Road+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Jerome Home",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-25549349; Mobile: 7350517761; Email: jeromehome@yahoo.in",
        address: "No. 13, Pettigrew Street, Richmond Town, Bengaluru – 560025, Karnataka",
        locationLink: "https://maps.google.com/?q=Jerome+Home+Richmond+Town+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Katherine Nivas Senior Citizen's Home",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-28467218 / 080-28477618; Mobile: 9845348436; Email: katherinenivas@yahoo.com",
        address: "Post Box No. 7042, Daugherty Road Extension, Cantonement, Bengaluru – 560046, Karnataka",
        locationLink: "https://maps.google.com/?q=Katherine+Nivas+Senior+Citizens+Home+Cantonement+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Krupashrya Home for Old Destitute Women",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-25472062; Mobile: 9632296466; Email: magikscb@gmail.com",
        address: "Magadi Road, Kamakshipalya, Bengaluru – 560079, Karnataka",
        locationLink: "https://maps.google.com/?q=Krupashrya+Home+for+Old+Destitute+Women+Kamakshipalya+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Lourdes Home for Destitute Women",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-26430120; Mobile: 9035896029; Email: lourdeshomebgl@gmail.com",
        address: "Lourdes Matha Church Compound, Ulsoor, Bengaluru – 560008, Karnataka",
        locationLink: "https://maps.google.com/?q=Lourdes+Home+for+Destitute+Women+Ulsoor+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Maria Nivas",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 0843211250; Mobile: 9449529669",
        address: "Home for the Destitute, Huskuru P.O. Opp. Global Village Tech Park, Bengaluru – 562157, Karnataka",
        locationLink: "https://maps.google.com/?q=Maria+Nivas+Huskuru+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Mercy Home (for Destitute Women)",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-28465331; Mobile: 7259324164",
        address: "Holy Cross Institute, Thigalarapalya, Peenya, Bengaluru – 560058, Karnataka",
        locationLink: "https://maps.google.com/?q=Mercy+Home+Thigalarapalya+Peenya+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Nirmala Seva Kendra for Old Ladies",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-22711059; Email: goodshepherd@dataone.in",
        address: "Good Shepherd Convent, Museum Road, Bengaluru – 560001, Karnataka",
        locationLink: "https://maps.google.com/?q=Nirmala+Seva+Kendra+Museum+Road+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Providence Home",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-28441605; Mobile: 9620558013; Email: providencenilaya@gmail.com",
        address: "Daughters of Charity, Frazer Town, Bengaluru – 560005, Karnataka",
        locationLink: "https://maps.google.com/?q=Providence+Home+Frazer+Town+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "Sacred Heart Bhavan (Old Age Home)",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Mobile: 7829158262; Email: josmyjosesh@gmail.com",
        address: "Divine Charitable Trust, Koramangala, Bengaluru – 560034, Karnataka",
        locationLink: "https://maps.google.com/?q=Sacred+Heart+Bhavan+Koramangala+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "St. Joseph Elderly Home",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Mobile: 7022449642/7022449643; Email: sjelderlyhomegs@gmail.com",
        address: "St. Joseph's Church, Palace Road, Bengaluru – 560001, Karnataka",
        locationLink: "https://maps.google.com/?q=St+Joseph+Elderly+Home+Palace+Road+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },
      {
        name: "St. Theresa's Mercy Home",
        type: ["old_age_home"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-23570620; Mobile: 7259274759",
        address: "Rajajinagara, 1st Block, Dr. Rajkumar Road, Bengaluru – 560010, Karnataka",
        locationLink: "https://maps.google.com/?q=St+Theresas+Mercy+Home+Rajajinagar+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore old age homes list"
      },

      // ORPHANAGES
      {
        name: "Abhayadhama (Home for Street Boys)",
        type: ["orphanage"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-28452352; Mobile: 8903601981; Email: masicsc@yahoo.com",
        address: "Mariya Seva Sangha, Lingarajapuram, Bengaluru – 560084, Karnataka",
        locationLink: "https://maps.google.com/?q=Abhayadhama+Lingarajapuram+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore orphanages list"
      },
      {
        name: "Bala Yesu Bhavan",
        type: ["orphanage"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-26431801; Mobile: 9480586250; Email: alvernabgl@gmail.com",
        address: "SOS Post, Kadugodi Post, Whitefield, Bengaluru – 560067, Karnataka",
        locationLink: "https://maps.google.com/?q=Bala+Yesu+Bhavan+Kadugodi+Whitefield+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore orphanages list"
      },
      {
        name: "Good Shepherd Home for the Children",
        type: ["orphanage"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-22122744; Email: maryrgs2012@gmail.com",
        address: "Museum Road, Bengaluru – 560001, Karnataka",
        locationLink: "https://maps.google.com/?q=Good+Shepherd+Home+for+Children+Museum+Road+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore orphanages list"
      },
      {
        name: "Makkala Jeevodaya (Centre for children in conflict with law)",
        type: ["orphanage"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-42229580; Mobile: 7338562788; Email: makkalajeevodaya@gmail.com",
        address: "Sumanahalli, Bengaluru North, Karnataka",
        locationLink: "https://maps.google.com/?q=Makkala+Jeevodaya+Sumanahalli+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore orphanages list"
      },
      {
        name: "Namma Kutumbashrama (Home for Abandoned Women & Children)",
        type: ["orphanage"],
        district: "Bengaluru Urban",
        contactDetails: "Mobile: 984517121, 9901148861; Email: bijupaulscj@yahoo.co.in",
        address: "Kengeri Satellite Town, Bengaluru – 560060, Karnataka",
        locationLink: "https://maps.google.com/?q=Namma+Kutumbashrama+Kengeri+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore orphanages list"
      },
      {
        name: "Nirmala Shishu Bhavan",
        type: ["orphanage"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-25474993",
        address: "No. 4, Hennuru Main Road, Lingarajapuram, Bengaluru – 560084, Karnataka",
        locationLink: "https://maps.google.com/?q=Nirmala+Shishu+Bhavan+Lingarajapuram+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore orphanages list"
      },
      {
        name: "St. Mary's Orphanage",
        type: ["orphanage"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-25472623; Mobile: 9731220653; Email: marys.orphanage@gmail.com",
        address: "No. 71, Pottery Road, Near Central Railway Station, Bengaluru – 560001, Karnataka",
        locationLink: "https://maps.google.com/?q=St+Marys+Orphanage+Pottery+Road+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore orphanages list"
      },
      {
        name: "St. Patrick's Orphanage (For Boys)",
        type: ["orphanage"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-25590376 / 080-25587213; Mobile: 9342820070; Email: stpatricksboyshome@gmail.com",
        address: "Richmond Road, Bengaluru – 560025, Karnataka",
        locationLink: "https://maps.google.com/?q=St+Patricks+Orphanage+Richmond+Road+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore orphanages list"
      },
      {
        name: "St. Teresa's Children's Home",
        type: ["orphanage"],
        district: "Bengaluru Urban",
        contactDetails: "Mobile: 7760502906",
        address: "C/o. Holy Family Convent, Mariapura, Thattuguppe Post, Bengaluru – 560067, Karnataka",
        locationLink: "https://maps.google.com/?q=St+Teresas+Childrens+Home+Mariapura+Bengaluru",
        website: undefined,
        source: "Karnataka.com Bangalore orphanages list"
      },
      {
        name: "Suryodaya Boys Centre",
        type: ["orphanage"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-28439935; Mobile: 8050751156; Email: madanuprabakarcrs@gmail.com; Website: www.somascdontbosco.org",
        address: "Don Bosco Campus, Lingarajapuram, Bengaluru – 560084, Karnataka",
        locationLink: "https://maps.google.com/?q=Suryodaya+Boys+Centre+Don+Bosco+Lingarajapuram+Bengaluru",
        website: "www.somascdontbosco.org",
        source: "Karnataka.com Bangalore orphanages list"
      },

      // CHARITIES
      {
        name: "Samarthanam Trust for the Disabled",
        type: ["charity"],
        district: "Bengaluru Urban",
        contactDetails: "Phone: 080-26508641 / 080-26675543",
        address: "1/A, 5th Main, Bull Temple Road, N.R Colony, Bengaluru – 560019, Karnataka",
        locationLink: "https://maps.google.com/?q=Samarthanam+Trust+Bull+Temple+Road+Bengaluru",
        website: "www.samarthanam.org",
        source: "Karnataka.com Bangalore charities list"
      }
    ]
  },
  {
    district: "Mysuru",
    institutions: [
      {
        name: "Sri Chayadevi Anathashrama Trust",
        type: ["old_age_home", "charity"],
        district: "Mysuru",
        contactDetails: "Phone: 07383235788",
        address: "Jayanagar Extension, Mysuru – 570014, Karnataka",
        locationLink: "https://maps.google.com/?q=Sri+Chayadevi+Anathashrama+Trust+Jayanagar+Mysuru",
        website: undefined,
        source: "Karnataka.com Mysuru institutions list"
      },
      {
        name: "Sri Vasavi Shanthidhama",
        type: ["old_age_home"],
        district: "Mysuru",
        contactDetails: "Contact details available on request",
        address: "Mysuru, Karnataka",
        locationLink: "https://maps.google.com/?q=Sri+Vasavi+Shanthidhama+Mysuru",
        website: undefined,
        source: "Karnataka.com Mysuru institutions list"
      },
      {
        name: "Little Sisters of the Poor",
        type: ["old_age_home"],
        district: "Mysuru",
        contactDetails: "See local directory for contact",
        address: "Mysuru, Karnataka",
        locationLink: "https://maps.google.com/?q=Little+Sisters+of+the+Poor+Mysuru",
        website: undefined,
        source: "Karnataka.com Mysuru institutions list"
      },
      {
        name: "Guanella Preethi Nivas",
        type: ["old_age_home"],
        district: "Mysuru",
        contactDetails: "See local directory for contact",
        address: "Mysuru, Karnataka",
        locationLink: "https://maps.google.com/?q=Guanella+Preethi+Nivas+Mysuru",
        website: undefined,
        source: "Karnataka.com Mysuru institutions list"
      },
      {
        name: "Vatsalya Seva Foundation",
        type: ["old_age_home", "charity"],
        district: "Mysuru",
        contactDetails: "Phone: 09035034891",
        address: "Ashram Road, Hinkal, Mysuru – 570017, Karnataka",
        locationLink: "https://maps.google.com/?q=Vatsalya+Seva+Foundation+Hinkal+Mysuru",
        website: undefined,
        source: "Karnataka.com Mysuru institutions list"
      },
      {
        name: "TAMARA Health Care & Old Age Home",
        type: ["old_age_home"],
        district: "Mysuru",
        contactDetails: "Contact details available on request",
        address: "Mysuru, Karnataka",
        locationLink: "https://maps.google.com/?q=TAMARA+Health+Care+Old+Age+Home+Mysuru",
        website: undefined,
        source: "Karnataka.com Mysuru institutions list"
      },

      // ORPHANAGES IN MYSURU
      {
        name: "Sri Chayadevi Anathashrama Trust",
        type: ["orphanage", "charity"],
        district: "Mysuru",
        contactDetails: "Phone: 07383235788",
        address: "Jayanagar Extension, Mysuru – 570014, Karnataka",
        locationLink: "https://maps.google.com/?q=Sri+Chayadevi+Anathashrama+Trust+Jayanagar+Mysuru",
        website: undefined,
        source: "Karnataka.com Mysuru institutions list"
      },
      {
        name: "Vatsalya Seva Foundation",
        type: ["orphanage", "charity"],
        district: "Mysuru",
        contactDetails: "Phone: 09035034891",
        address: "Ashram Road, Hinkal, Mysuru – 570017, Karnataka",
        locationLink: "https://maps.google.com/?q=Vatsalya+Seva+Foundation+Hinkal+Mysuru",
        website: undefined,
        source: "Karnataka.com Mysuru institutions list"
      },
      {
        name: "Jeevanadi Seva Samsthe",
        type: ["orphanage", "charity"],
        district: "Mysuru",
        contactDetails: "Phone: 07383385593",
        address: "Hanchya, Hanchya, Mysuru, Karnataka",
        locationLink: "https://maps.google.com/?q=Jeevanadi+Seva+Samsthe+Hanchya+Mysuru",
        website: undefined,
        source: "Karnataka.com Mysuru institutions list"
      }
    ]
  }
];