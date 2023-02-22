// Here is some test data for local development

export const DEFAULT_TARGETS_COLLECTIONS = [
  {
    availablePublicationCount: 1,
    description: "",
    descriptionHtml: "",
    handle: "all",
    id: "gid://shopify/Collection/208665116833",
    productsAutomaticallySortedCount: 43,
    productsCount: 43,
    productsManuallySortedCount: 0,
    publicationCount: 1,
    seo: { description: null, title: null },
    ruleSet: {
      appliedDisjunctively: false,
      rules: [
        {
          column: "TYPE",
          condition: "island_generated",
          relation: "NOT_EQUALS",
        },
      ],
    },
    sortOrder: "BEST_SELLING",
    storefrontId: "Z2lkOi8vc2hvcGlmeS9Db2xsZWN0aW9uLzIwODY2NTExNjgzMw==",
    templateSuffix: null,
    title: "All Products",
    updatedAt: "2020-08-26T08:18:59Z",
  },
  {
    availablePublicationCount: 1,
    description: "",
    descriptionHtml: "",
    handle: "frontpage",
    id: "gid://shopify/Collection/202680860833",
    productsAutomaticallySortedCount: 0,
    productsCount: 0,
    productsManuallySortedCount: 0,
    publicationCount: 1,
    seo: { description: null, title: null },
    ruleSet: null,
    sortOrder: "BEST_SELLING",
    storefrontId: "Z2lkOi8vc2hvcGlmeS9Db2xsZWN0aW9uLzIwMjY4MDg2MDgzMw==",
    templateSuffix: null,
    title: "Home page",
    updatedAt: "2020-08-15T16:00:20Z",
  },
];

export const DEFAULT_PRODUCT = {
  availablePublicationCount: 1,
  createdAt: "2020-06-22T12:28:34Z",
  descriptionHtml:
    "<p>Blue silk tuxedo with marbled aquatic pattern and dark lining. Sleeves are complete with rounded hem and black buttons.</p>",
  handle: "blue-silk-tuxedo",
  hasOnlyDefaultVariant: false,
  id: "gid://shopify/Product/5310953062561",
  image:
    "https://cdn.shopify.com/s/files/1/0416/4281/9745/products/man-adjusts-blue-tuxedo-bowtie_925x_656f2a36-34a8-4db2-9701-c01e49e9e5c0.jpg?v=1592828914",
  options: [
    {
      id: "gid://shopify/ProductOption/6787477176481",
      name: "Title",
      position: 1,
      values: ["xs", "small", "medium", "large", "xl", "xxl"],
    },
  ],
  productType: "",
  publishedAt: "2020-06-22T12:28:33Z",
  tags: ["men"],
  templateSuffix: null,
  title: "Blue Silk Tuxedo",
  totalInventory: 68,
  tracksInventory: true,
  updatedAt: "2020-06-24T05:14:00Z",
  variants: [
    {
      availableForSale: true,
      barcode: null,
      compareAtPrice: null,
      createdAt: "2020-06-22T12:28:34Z",
      displayName: "Blue Silk Tuxedo - xs",
      fulfillmentService: {
        id: "gid://shopify/FulfillmentService/manual",
        inventoryManagement: false,
        productBased: true,
        serviceName: "Manual",
        type: "MANUAL",
      },
      id: "gid://shopify/ProductVariant/34771724697761",
      inventoryItem: {
        id: "gid://shopify/InventoryItem/36676036984993",
        __typename: "InventoryItem",
      },
      inventoryManagement: "SHOPIFY",
      inventoryPolicy: "CONTINUE",
      inventoryQuantity: 16,
      position: 1,
      price: "20.00",
      product: {
        id: "gid://shopify/Product/5310953062561",
        __typename: "Product",
      },
      requiresShipping: true,
      selectedOptions: [{ value: "xs", __typename: "SelectedOption" }],
      sku: "",
      taxable: true,
      title: "xs",
      updatedAt: "2020-06-24T05:14:00Z",
      weight: 457,
      weightUnit: "GRAMS",
      image: null,
    },
    {
      availableForSale: true,
      barcode: null,
      compareAtPrice: null,
      createdAt: "2020-06-22T12:28:34Z",
      displayName: "Blue Silk Tuxedo - small",
      fulfillmentService: {
        id: "gid://shopify/FulfillmentService/manual",
        inventoryManagement: false,
        productBased: true,
        serviceName: "Manual",
        type: "MANUAL",
      },
      id: "gid://shopify/ProductVariant/34771724730529",
      inventoryItem: {
        id: "gid://shopify/InventoryItem/36676037017761",
        __typename: "InventoryItem",
      },
      inventoryManagement: "SHOPIFY",
      inventoryPolicy: "CONTINUE",
      inventoryQuantity: 9,
      position: 2,
      price: "60.00",
      product: {
        id: "gid://shopify/Product/5310953062561",
        __typename: "Product",
      },
      requiresShipping: true,
      selectedOptions: [{ value: "small", __typename: "SelectedOption" }],
      sku: "",
      taxable: true,
      title: "small",
      updatedAt: "2020-06-22T12:28:34Z",
      weight: 346,
      weightUnit: "GRAMS",
      image: null,
    },
    {
      availableForSale: true,
      barcode: null,
      compareAtPrice: null,
      createdAt: "2020-06-22T12:28:34Z",
      displayName: "Blue Silk Tuxedo - medium",
      fulfillmentService: {
        id: "gid://shopify/FulfillmentService/manual",
        inventoryManagement: false,
        productBased: true,
        serviceName: "Manual",
        type: "MANUAL",
      },
      id: "gid://shopify/ProductVariant/34771724763297",
      inventoryItem: {
        id: "gid://shopify/InventoryItem/36676037083297",
        __typename: "InventoryItem",
      },
      inventoryManagement: "SHOPIFY",
      inventoryPolicy: "CONTINUE",
      inventoryQuantity: 14,
      position: 3,
      price: "47.00",
      product: {
        id: "gid://shopify/Product/5310953062561",
        __typename: "Product",
      },
      requiresShipping: true,
      selectedOptions: [{ value: "medium", __typename: "SelectedOption" }],
      sku: "",
      taxable: true,
      title: "medium",
      updatedAt: "2020-06-22T12:28:34Z",
      weight: 268,
      weightUnit: "GRAMS",
      image: null,
    },
    {
      availableForSale: true,
      barcode: null,
      compareAtPrice: null,
      createdAt: "2020-06-22T12:28:34Z",
      displayName: "Blue Silk Tuxedo - large",
      fulfillmentService: {
        id: "gid://shopify/FulfillmentService/manual",
        inventoryManagement: false,
        productBased: true,
        serviceName: "Manual",
        type: "MANUAL",
      },
      id: "gid://shopify/ProductVariant/34771724796065",
      inventoryItem: {
        id: "gid://shopify/InventoryItem/36676037148833",
        __typename: "InventoryItem",
      },
      inventoryManagement: "SHOPIFY",
      inventoryPolicy: "CONTINUE",
      inventoryQuantity: 17,
      position: 4,
      price: "60.00",
      product: {
        id: "gid://shopify/Product/5310953062561",
        __typename: "Product",
      },
      requiresShipping: true,
      selectedOptions: [{ value: "large", __typename: "SelectedOption" }],
      sku: "",
      taxable: true,
      title: "large",
      updatedAt: "2020-06-22T12:28:34Z",
      weight: 230,
      weightUnit: "GRAMS",
      image: null,
    },
    {
      availableForSale: true,
      barcode: null,
      compareAtPrice: null,
      createdAt: "2020-06-22T12:28:34Z",
      displayName: "Blue Silk Tuxedo - xl",
      fulfillmentService: {
        id: "gid://shopify/FulfillmentService/manual",
        inventoryManagement: false,
        productBased: true,
        serviceName: "Manual",
        type: "MANUAL",
      },
      id: "gid://shopify/ProductVariant/34771724828833",
      inventoryItem: {
        id: "gid://shopify/InventoryItem/36676037214369",
        __typename: "InventoryItem",
      },
      inventoryManagement: "SHOPIFY",
      inventoryPolicy: "CONTINUE",
      inventoryQuantity: 10,
      position: 5,
      price: "30.00",
      product: {
        id: "gid://shopify/Product/5310953062561",
        __typename: "Product",
      },
      requiresShipping: true,
      selectedOptions: [{ value: "xl", __typename: "SelectedOption" }],
      sku: "",
      taxable: true,
      title: "xl",
      updatedAt: "2020-06-22T12:28:34Z",
      weight: 341,
      weightUnit: "GRAMS",
      image: null,
    },
    {
      availableForSale: true,
      barcode: null,
      compareAtPrice: null,
      createdAt: "2020-06-22T12:28:34Z",
      displayName: "Blue Silk Tuxedo - xxl",
      fulfillmentService: {
        id: "gid://shopify/FulfillmentService/manual",
        inventoryManagement: false,
        productBased: true,
        serviceName: "Manual",
        type: "MANUAL",
      },
      id: "gid://shopify/ProductVariant/34771724894369",
      inventoryItem: {
        id: "gid://shopify/InventoryItem/36676037247137",
        __typename: "InventoryItem",
      },
      inventoryManagement: "SHOPIFY",
      inventoryPolicy: "CONTINUE",
      inventoryQuantity: 2,
      position: 6,
      price: "44.00",
      product: {
        id: "gid://shopify/Product/5310953062561",
        __typename: "Product",
      },
      requiresShipping: true,
      selectedOptions: [{ value: "xxl", __typename: "SelectedOption" }],
      sku: "",
      taxable: true,
      title: "xxl",
      updatedAt: "2020-06-22T12:28:34Z",
      weight: 484,
      weightUnit: "GRAMS",
      image: null,
    },
  ],
  vendor: "Liam Fashions",
};

export const DEFAULT_PRODUCT_NO_IMG = {
  availablePublicationCount: 1,
  createdAt: "2020-08-11T12:59:21Z",
  descriptionHtml: "",
  handle: "test-sans-imagee",
  hasOnlyDefaultVariant: true,
  id: "gid://shopify/Product/5514736730273",
  images: [],
  options: [
    {
      id: "gid://shopify/ProductOption/7030232481953",
      name: "Title",
      position: 1,
      values: ["Default Title"],
    },
  ],
  productType: "",
  publishedAt: "2020-08-11T12:59:22Z",
  tags: [],
  templateSuffix: "",
  title: "test sans imagee",
  totalInventory: 0,
  tracksInventory: true,
  updatedAt: "2020-08-11T12:59:23Z",
  variants: [
    {
      availableForSale: false,
      barcode: "",
      compareAtPrice: null,
      createdAt: "2020-08-11T12:59:22Z",
      displayName: "test sans imagee - Default Title",
      fulfillmentService: {
        id: "gid://shopify/FulfillmentService/manual",
        inventoryManagement: false,
        productBased: true,
        serviceName: "Manual",
        type: "MANUAL",
      },
      id: "gid://shopify/ProductVariant/35606942351521",
      inventoryItem: {
        id: "gid://shopify/InventoryItem/37606585532577",
        __typename: "InventoryItem",
      },
      inventoryManagement: "SHOPIFY",
      inventoryPolicy: "DENY",
      inventoryQuantity: 0,
      position: 1,
      price: "0.00",
      product: {
        id: "gid://shopify/Product/5514736730273",
        __typename: "Product",
      },
      requiresShipping: true,
      selectedOptions: [
        { value: "Default Title", __typename: "SelectedOption" },
      ],
      sku: "",
      taxable: true,
      title: "Default Title",
      updatedAt: "2020-08-11T12:59:22Z",
      weight: 0,
      weightUnit: "KILOGRAMS",
    },
  ],
  vendor: "Island Test",
};

export const DEFAULT_TARGETS = [
  DEFAULT_PRODUCT,
  DEFAULT_PRODUCT_NO_IMG,
  {
    availablePublicationCount: 1,
    createdAt: "2020-06-22T12:29:06Z",
    descriptionHtml:
      "<p>Womens casual varsity top, This grey and black buttoned top is a sport-inspired piece complete with an embroidered letter.</p>",
    handle: "classic-varsity-top",
    hasOnlyDefaultVariant: false,
    id: "gid://shopify/Product/5310953848993",
    images: [
      {
        id: "gid://shopify/ProductImage/17475073048737",
        altText: "woman wearing light gray cotton varsity jacket",
        originalSrc:
          "https://cdn.shopify.com/s/files/1/0416/4281/9745/products/casual-fashion-woman_925x_400a5af0-2457-49d9-9ef2-029a9850d738.jpg?v=1592828946",
      },
    ],
    options: [
      {
        id: "gid://shopify/ProductOption/6787478225057",
        name: "Title",
        position: 1,
        values: ["xs", "small", "medium", "large", "xl", "xxl"],
      },
    ],
    productType: "",
    publishedAt: "2020-06-22T12:29:05Z",
    tags: ["women"],
    templateSuffix: null,
    title: "Classic Varsity Top",
    totalInventory: 54,
    tracksInventory: true,
    updatedAt: "2020-06-22T12:29:07Z",
    variants: [
      {
        availableForSale: true,
        barcode: null,
        compareAtPrice: null,
        createdAt: "2020-06-22T12:29:07Z",
        displayName: "Classic Varsity Top - xs",
        fulfillmentService: {
          id: "gid://shopify/FulfillmentService/manual",
          inventoryManagement: false,
          productBased: true,
          serviceName: "Manual",
          type: "MANUAL",
        },
        id: "gid://shopify/ProductVariant/34771729285281",
        inventoryItem: {
          id: "gid://shopify/InventoryItem/36676041244833",
          __typename: "InventoryItem",
        },
        inventoryManagement: "SHOPIFY",
        inventoryPolicy: "CONTINUE",
        inventoryQuantity: 8,
        position: 1,
        price: "76.00",
        product: {
          id: "gid://shopify/Product/5310953848993",
          __typename: "Product",
        },
        requiresShipping: true,
        selectedOptions: [{ value: "xs", __typename: "SelectedOption" }],
        sku: "",
        taxable: true,
        title: "xs",
        updatedAt: "2020-06-22T12:29:07Z",
        weight: 416,
        weightUnit: "GRAMS",
      },
      {
        availableForSale: true,
        barcode: null,
        compareAtPrice: null,
        createdAt: "2020-06-22T12:29:07Z",
        displayName: "Classic Varsity Top - small",
        fulfillmentService: {
          id: "gid://shopify/FulfillmentService/manual",
          inventoryManagement: false,
          productBased: true,
          serviceName: "Manual",
          type: "MANUAL",
        },
        id: "gid://shopify/ProductVariant/34771729318049",
        inventoryItem: {
          id: "gid://shopify/InventoryItem/36676041277601",
          __typename: "InventoryItem",
        },
        inventoryManagement: "SHOPIFY",
        inventoryPolicy: "CONTINUE",
        inventoryQuantity: 7,
        position: 2,
        price: "62.00",
        product: {
          id: "gid://shopify/Product/5310953848993",
          __typename: "Product",
        },
        requiresShipping: true,
        selectedOptions: [{ value: "small", __typename: "SelectedOption" }],
        sku: "",
        taxable: true,
        title: "small",
        updatedAt: "2020-06-22T12:29:07Z",
        weight: 290,
        weightUnit: "GRAMS",
      },
      {
        availableForSale: true,
        barcode: null,
        compareAtPrice: null,
        createdAt: "2020-06-22T12:29:07Z",
        displayName: "Classic Varsity Top - medium",
        fulfillmentService: {
          id: "gid://shopify/FulfillmentService/manual",
          inventoryManagement: false,
          productBased: true,
          serviceName: "Manual",
          type: "MANUAL",
        },
        id: "gid://shopify/ProductVariant/34771729350817",
        inventoryItem: {
          id: "gid://shopify/InventoryItem/36676041310369",
          __typename: "InventoryItem",
        },
        inventoryManagement: "SHOPIFY",
        inventoryPolicy: "CONTINUE",
        inventoryQuantity: 6,
        position: 3,
        price: "73.00",
        product: {
          id: "gid://shopify/Product/5310953848993",
          __typename: "Product",
        },
        requiresShipping: true,
        selectedOptions: [{ value: "medium", __typename: "SelectedOption" }],
        sku: "",
        taxable: true,
        title: "medium",
        updatedAt: "2020-06-22T12:29:07Z",
        weight: 263,
        weightUnit: "GRAMS",
      },
      {
        availableForSale: true,
        barcode: null,
        compareAtPrice: null,
        createdAt: "2020-06-22T12:29:07Z",
        displayName: "Classic Varsity Top - large",
        fulfillmentService: {
          id: "gid://shopify/FulfillmentService/manual",
          inventoryManagement: false,
          productBased: true,
          serviceName: "Manual",
          type: "MANUAL",
        },
        id: "gid://shopify/ProductVariant/34771729383585",
        inventoryItem: {
          id: "gid://shopify/InventoryItem/36676041343137",
          __typename: "InventoryItem",
        },
        inventoryManagement: "SHOPIFY",
        inventoryPolicy: "CONTINUE",
        inventoryQuantity: 20,
        position: 4,
        price: "31.00",
        product: {
          id: "gid://shopify/Product/5310953848993",
          __typename: "Product",
        },
        requiresShipping: true,
        selectedOptions: [{ value: "large", __typename: "SelectedOption" }],
        sku: "",
        taxable: true,
        title: "large",
        updatedAt: "2020-06-22T12:29:07Z",
        weight: 351,
        weightUnit: "GRAMS",
      },
      {
        availableForSale: true,
        barcode: null,
        compareAtPrice: null,
        createdAt: "2020-06-22T12:29:07Z",
        displayName: "Classic Varsity Top - xl",
        fulfillmentService: {
          id: "gid://shopify/FulfillmentService/manual",
          inventoryManagement: false,
          productBased: true,
          serviceName: "Manual",
          type: "MANUAL",
        },
        id: "gid://shopify/ProductVariant/34771729416353",
        inventoryItem: {
          id: "gid://shopify/InventoryItem/36676041375905",
          __typename: "InventoryItem",
        },
        inventoryManagement: "SHOPIFY",
        inventoryPolicy: "CONTINUE",
        inventoryQuantity: 7,
        position: 5,
        price: "64.00",
        product: {
          id: "gid://shopify/Product/5310953848993",
          __typename: "Product",
        },
        requiresShipping: true,
        selectedOptions: [{ value: "xl", __typename: "SelectedOption" }],
        sku: "",
        taxable: true,
        title: "xl",
        updatedAt: "2020-06-22T12:29:07Z",
        weight: 217,
        weightUnit: "GRAMS",
      },
      {
        availableForSale: true,
        barcode: null,
        compareAtPrice: null,
        createdAt: "2020-06-22T12:29:07Z",
        displayName: "Classic Varsity Top - xxl",
        fulfillmentService: {
          id: "gid://shopify/FulfillmentService/manual",
          inventoryManagement: false,
          productBased: true,
          serviceName: "Manual",
          type: "MANUAL",
        },
        id: "gid://shopify/ProductVariant/34771729449121",
        inventoryItem: {
          id: "gid://shopify/InventoryItem/36676041408673",
          __typename: "InventoryItem",
        },
        inventoryManagement: "SHOPIFY",
        inventoryPolicy: "CONTINUE",
        inventoryQuantity: 6,
        position: 6,
        price: "43.00",
        product: {
          id: "gid://shopify/Product/5310953848993",
          __typename: "Product",
        },
        requiresShipping: true,
        selectedOptions: [{ value: "xxl", __typename: "SelectedOption" }],
        sku: "",
        taxable: true,
        title: "xxl",
        updatedAt: "2020-06-22T12:29:07Z",
        weight: 466,
        weightUnit: "GRAMS",
      },
    ],
    vendor: "Liam Fashions",
  },
];
