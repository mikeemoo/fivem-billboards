const zlib = require("zlib");
const fs = require("fs");
const path = require("path");
const { Builder } = require("xml2js");
const Quaternion = require("quaternion");

var builder = new Builder();

const generateOdr = (name, width, height, depth) => {
  const odr = `Version 165 32
{
	Shaders
	{
		default.sps
		{
			DiffuseSampler ${name}\\texture.otx
			HardAlphaBlend 1.0000000
			UseTessellation 0.0000000
		}
	}
	Skeleton null
	LodGroup
	{
		High 80.0
		{
			${name}\\high.mesh 0
		}
		Med 9998.0
		{
			${name}\\low.mesh 0
		}
		Low 9998.0
		Vlow 9998.0
		AABBMin -${width * 0.6} -${depth * 1.1} -${height * 0.6}
		AABBMax ${width * 1.6} ${depth * 1.1} ${height * 1.6}
		Radius ${Math.max(width, height) * 1.6}
		Center 0.0000000 0.0 0.0000000
	}
	Light null
	Bound null
	Joints null
}`;
return odr;
};


const generateMesh = (width, height, offset) => {

  const widthH = width / 2;
  const heightH = height / 2;

  return `Version 165 32
{
	Locked false
	Skinned false
	BoneCount 0
	Mask 255
	Bounds
	{
		Aabb
		{
			Min -${widthH * 1.1} -${offset} -${heightH * 1.1}
			Max ${widthH * 1.1} ${offset} ${heightH * 1.1}
		}
	}
	Geometries
	{
		Geometry
		{
			ShaderIndex 0
			Flags -
			VertexDeclaration N209731BE
			Indices 6
			{
				0 2 4 5 3 1
			}
			Vertices 6
			{
				-${widthH} ${-offset} -${heightH} / 0.0000000 -1.0000000 0.0000000 / 255 255 255 255 / 0.0000000 0.0000000
				-${widthH} ${-offset} -${heightH} / 0.0000000 -1.0000000 0.0000000 / 255 255 255 255 / 0.0000000 0.0000000
				${widthH} ${-offset} -${heightH} / 0.0000000 -1.0000000 0.0000000 / 255 255 255 255 / 1.0000000 0.0000000
				-${widthH} ${-offset} ${heightH} / 0.0000000 -1.0000000 0.0000000 / 255 255 255 255 / 0.0000000 -1.0000000
				${widthH} ${-offset} ${heightH} / 0.0000000 -1.0000000 0.0000000 / 255 255 255 255 / 1.0000000 -1.0000000
				${widthH} ${-offset} ${heightH} / 0.0000000 -1.0000000 0.0000000 / 255 255 255 255 / 1.0000000 -1.0000000
			}
		}
	}
}
`;
}

const generateOtx = () => `Version 13 30
{
	Image texture.dds
	Type Regular
	PixelFormat DXT5
	Levels 7
	Usage DIFFUSE
	UsageFlags NOT_HALF HD_SPLIT
	ExtraFlags 0
}`


const generateYtyp = (name, width, height, lod) => builder.buildObject({
  CMapTypes: {
    extensions:[""],
    archetypes: [
      {Item:[
        {$:{type:"CBaseArchetypeDef"},
        lodDist: [{ $: { value: lod }}],
        flags: [{ $: { value: 0 }}],
        specialAttribute: [{ $: { value: 0 }}],
        bbMin: [{ $: { x: -width, y: -0.0001, z: -height}}],
        bbMax: [{ $: { x: width, y: 0.0001, z: height }}],
        bsCentre: [{ $: { x: 0.00000000, y: 0.00000000, z: 0.00000000 }}],
        bsRadius: [{ $: { value: Math.max(width, height) }}],
        hdTextureDist: [{ $: { value: lod }}],
        name: [ name ],
        textureDictionary: [ name ],
        clipDictionary: [""],
        drawableDictionary: [""],
        physicsDictionary: [""],
        assetType: [ "ASSET_TYPE_DRAWABLE" ],
        assetName: [ name ],
        extensions :[""]
      }]}
    ],
    name: [""],
    dependencies: [""],
    compositeEntityTypes:[""]
  }
});

const generateYmap = (name, worldPosition, quaternion, p1, p2, lod ) => builder.buildObject({ 
  CMapData: {
    name: [ name ],
    parent: [ "" ],
    flags: [{ $: { value: 32 }}],
    contentFlags: [{ $: { value: 1 }}],
    streamingExtentsMin: [{ $: {
      x: worldPosition.x + Math.min(p1.x, p2.x) - lod,
      y: worldPosition.y + Math.min(p1.y, p2.y) - lod,
      z: worldPosition.z + Math.min(p1.z, p2.z) - lod
    }}],
    streamingExtentsMax: [{ $: {
      x: worldPosition.x + Math.max(p1.x, p2.x) + lod,
      y: worldPosition.y + Math.max(p1.y, p2.y) + lod,
      z: worldPosition.z + Math.max(p1.z, p2.z) + lod
    }}],
    entitiesExtentsMin:  [{ $: {
      x: worldPosition.x + Math.min(p1.x, p2.x),
      y: worldPosition.y + Math.min(p1.y, p2.y),
      z: worldPosition.z + Math.min(p1.z, p2.z)
    }}],
    entitiesExtentsMax:  [{ $: {
      x: worldPosition.x + Math.max(p1.x, p2.x),
      y: worldPosition.y + Math.max(p1.y, p2.y),
      z: worldPosition.z + Math.max(p1.z, p2.z)
    }}],
    entities: [
      { Item: [{
        $: { type: "CEntityDef" },
        archetypeName: [ name ],
        flags: [{ $: { value: 1572864  }}],
        guid: [{ $: { value: 0 }}],
        position: [{ $: {
          x: worldPosition.x + (p1.x + (p2.x - p1.x) / 2),
          y: worldPosition.y + (p1.y + (p2.y - p1.y) / 2),
          z: worldPosition.z + (p1.z + (p2.z - p1.z) / 2),
        }}],
        rotation: [{ $: quaternion }],
        scaleXY: [ { $: { value: 1.00000000 }}],
        scaleZ: [ { $: { value: 1.00000000 }}],
        parentIndex: [ { $: { value: -1 }}],
        lodDist: [{ $: { value: lod }}],
        childLodDist: [ { $: { value: 0 }}],
        lodLevel: [ "LODTYPES_DEPTH_HD" ],
        numChildren: [{ $: { value: 0 }}],
        priorityLevel: ["PRI_REQUIRED"],
        extensions: [""],
        ambientOcclusionMultiplier: [{ $: { value: 255 }}],
        artificialAmbientOcclusion: [{ $: { value: 255 }}],
        tintValue: [{ $: { value: 0 }}]}]}
    ],
    containerLods: [""],
    boxOccluders: [""],
    occludeModels: [""],
    physicsDictionaries: [""],
    instancedData: [{
      ImapLink: [""],
      PropInstanceList: [""],
      GrassInstanceList: [""]
    }],
    timeCycleModifiers: [""],
    carGenerators: [""],
    LODLightsSOA: [{
      direction: [""],
      falloff: [""],
      falloffExponent: [""],
      timeAndStateFlags: [""],
      hash: [""],
      coneInnerAngle: [""],
      coneOuterAngleOrCapExt: [""],
      coronaIntensity: [""]
    }],
    DistantLODLightsSOA: [{ position: [""], RGBI: ["" ], numStreetLights: [{ $: { value: 0 }}], category: [ { $: { value: 0 }}]}],
    block: [{ version: [{ $: { value: 0 }}], flags: [{ $: { value: 0 }}], name: [ name ], owner: [""] }]
  }
});


const generateManifest = (billboardNames) => builder.buildObject({
  CPackFileMetaData: {
    MapDataGroups: [""],
    HDTxdBindingArray: [""],
    imapDependencies: [""],
    itypDependencies_2: [""],
    Interiors: [""],
    imapDependencies_2: {
      Item: billboardNames.map((name) => ({
        imapName: `${name}`,
        manifestFlags: [""],
        itypDepArray: [{
          Item: name
        }]
      }))
    }
  }
});

(async () => {
  const billboards = JSON.parse(fs.readFileSync(path.join(__dirname, "definitions.json"), "utf8"));
  
  const outDir = path.join(__dirname, "..", "raw");

  Object.keys(billboards).forEach(async (name) => {

    const { bottomLeft, topRight, worldPosition, lod = 80, lodOffset = 0.05, offset = 0.001 } = billboards[name];

    const [ , x, y, z ] = worldPosition.match(/X:([^/s]+)Y:([^/s]+)Z:([^/s]+)/);

    const worldPos = { x: Number(x), y: Number(y), z: Number(z) };

    const width = Math.sqrt(((topRight.x - bottomLeft.x) ** 2) + ((topRight.y - bottomLeft.y) ** 2));
    const height = Math.sqrt((topRight.z - bottomLeft.z) ** 2);

    const yaw = Math.atan2(topRight.y - bottomLeft.y, topRight.x - bottomLeft.x);
    
    // let offsetPositionLod = {
    //   x: wX + (Math.sin(yaw) * lodOffset),
    //   y: wY + ((-1 * Math.cos(yaw)) * lodOffset),
    //   z: wZ
    // };

    const meshDir = path.join(outDir, name);

    const odr = generateOdr(name, width, height, lodOffset);
    fs.writeFileSync(path.join(outDir, `${name}.odr`), odr);
    
    
    if (!fs.existsSync(meshDir)) {
      fs.mkdirSync(meshDir);
    }

    const meshLow = generateMesh(width, height, lodOffset);
    const meshHigh = generateMesh(width, height, offset);

    fs.writeFileSync(path.join(meshDir, "low.mesh"), meshLow);
    fs.writeFileSync(path.join(meshDir, "high.mesh"), meshHigh);
    
    fs.copyFileSync(path.join(__dirname, "texture.dds"), path.join(meshDir, "texture.dds"));
    
    const otx = generateOtx();
    fs.writeFileSync(path.join(meshDir, "texture.otx"), otx);

    const ytyp = generateYtyp(name, width, height, 1000);

    fs.writeFileSync(path.join(outDir, `${name}.ytyp.xml`), ytyp);

    const quaternion = Quaternion.fromEuler(0, 0, -yaw);
    const ymap = generateYmap(name, worldPos, { x: 0, y: 0, z: quaternion.y, w: quaternion.w }, bottomLeft, topRight, 1000);
    fs.writeFileSync(path.join(outDir, `${name}.ymap.xml`), ymap);
  });

  const manifest = generateManifest(Object.keys(billboards));
  fs.writeFileSync(path.join(outDir, "_manifest_billboards.ymf.xml"), manifest);
})();